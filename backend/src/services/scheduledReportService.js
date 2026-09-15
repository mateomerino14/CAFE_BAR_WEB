import { query } from '../config/db.js';
import { getTopProductsReport } from './reportsService.js';
import { sendReportPdfEmail } from './emailService.js';

const escapeHtml = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const getScheduledReportConfig = async () => {
  const result = await query(`SELECT email, dia_semana, hora, ultimo_envio FROM scheduled_report_config LIMIT 1`);
  return result.rows[0] || { email: '', dia_semana: null, hora: null, ultimo_envio: null };
};

export const updateScheduledReportConfig = async (email, diaSemana, hora) => {
  const existingResult = await query(`SELECT id FROM scheduled_report_config LIMIT 1`);
  const existing = existingResult.rows[0];

  if (existing) {
    await query(
      `UPDATE scheduled_report_config SET email = $1, dia_semana = $2, hora = $3 WHERE id = $4`,
      [email, diaSemana, hora, existing.id]
    );
  } else {
    await query(
      `INSERT INTO scheduled_report_config (email, dia_semana, hora) VALUES ($1, $2, $3)`,
      [email, diaSemana, hora]
    );
  }
};

const buildScheduledReportHtml = (rows, fechaTexto) => {
  const headers = ['Tipo', 'Nombre', 'Cantidad', 'Ingreso', 'Costo', 'Ganancia'];
  const body = rows.map((r) => `
    <tr>
      <td>${escapeHtml(r.tipo === 'promocion' ? 'Promoción' : 'Producto')}</td>
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.cantidad)}</td>
      <td>Bs ${r.ingreso.toFixed(2)}</td>
      <td>Bs ${r.costo.toFixed(2)}</td>
      <td>Bs ${r.ganancia.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
          h1 { font-size: 18px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>Productos y Promociones (Ganancia) — ${escapeHtml(fechaTexto)}</h1>
        <table>
          <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>${body || '<tr><td colspan="6">Sin ventas registradas</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `;
};

const getBoliviaNow = () => {
  const now = new Date();
  return new Date(now.getTime() - 4 * 60 * 60 * 1000);
};

const getLastScheduledDate = (bolivianNow, diaSemana, configuredHHMM) => {
  const currentHHMM = `${String(bolivianNow.getUTCHours()).padStart(2, '0')}:${String(bolivianNow.getUTCMinutes()).padStart(2, '0')}`;
  const currentDay = bolivianNow.getUTCDay();

  let daysBack = (currentDay - diaSemana + 7) % 7;
  if (daysBack === 0 && currentHHMM < configuredHHMM) {
    daysBack = 7;
  }

  const target = new Date(bolivianNow);
  target.setUTCDate(target.getUTCDate() - daysBack);
  return target.toISOString().slice(0, 10);
};

export const runScheduledReportCheck = async () => {
  const config = await getScheduledReportConfig();
  if (!config.email || config.dia_semana === null || !config.hora) return;

  const bolivianNow = getBoliviaNow();
  const configuredHHMM = config.hora.slice(0, 5);
  const lastScheduledDate = getLastScheduledDate(bolivianNow, config.dia_semana, configuredHHMM);

  const ultimoEnvioStr = config.ultimo_envio instanceof Date ? config.ultimo_envio.toISOString().slice(0, 10) : config.ultimo_envio;
  if (ultimoEnvioStr === lastScheduledDate) return;

  const rows = await getTopProductsReport(lastScheduledDate, lastScheduledDate);
  const html = buildScheduledReportHtml(rows, lastScheduledDate);

  try {
    await sendReportPdfEmail(config.email, 'Reporte Semanal Automático', html);
    const existingResult = await query(`SELECT id FROM scheduled_report_config LIMIT 1`);
    await query(`UPDATE scheduled_report_config SET ultimo_envio = $1 WHERE id = $2`, [lastScheduledDate, existingResult.rows[0].id]);
    console.log(`Reporte automático enviado a ${config.email} (correspondiente al ${lastScheduledDate})`);
  } catch (error) {
    console.error('Error enviando reporte automático:', error.message);
  }
};
