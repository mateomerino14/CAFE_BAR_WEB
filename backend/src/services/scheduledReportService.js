import { query } from '../config/db.js';
import { getTopProductsReport } from './reportsService.js';
import { sendReportPdfEmail } from './emailService.js';

/* Escapa caracteres HTML para evitar contenido no seguro */
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

/* Obtiene la configuración del reporte programado */
const formatFecha = (fecha) => {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

/* Actualiza o crea la configuración del reporte programado */
const buildScheduledReportHtml = (rows, fechaInicio, fechaFin) => {
  const periodo = fechaInicio === fechaFin ? formatFecha(fechaInicio) : `${formatFecha(fechaInicio)} al ${formatFecha(fechaFin)}`;
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

  const totalIngreso = rows.reduce((sum, r) => sum + r.ingreso, 0);
  const totalCosto = rows.reduce((sum, r) => sum + r.costo, 0);
  const totalGanancia = rows.reduce((sum, r) => sum + r.ganancia, 0);

  const promoDetailBlocks = rows
    .filter((r) => r.tipo === 'promocion' && r.productosConsumidos?.length > 0)
    .map((r) => {
      const itemsHtml = r.productosConsumidos
        .map((pc) => `<tr><td>${escapeHtml(pc.nombre)}</td><td>${escapeHtml(pc.cantidad)}</td></tr>`)
        .join('');
      return `
        <div style="margin-top:16px;">
          <h3 style="margin-bottom:4px;">${escapeHtml(r.nombre)}</h3>
          <table>
            <thead><tr><th>Producto</th><th>Cantidad consumida</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
          h1 { font-size: 18px; }
          h2 { font-size: 15px; margin-top: 24px; }
          h3 { font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
          th { background: #f1f5f9; }
          .periodo { color: #64748b; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>Productos y Promociones (Ganancia)</h1>
        <p class="periodo">Período: ${escapeHtml(periodo)}</p>
        <table>
          <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
          <tbody>${body || '<tr><td colspan="6">Sin ventas registradas</td></tr>'}</tbody>
        </table>
        <p><strong>Total general — Ingreso: Bs ${totalIngreso.toFixed(2)} | Costo: Bs ${totalCosto.toFixed(2)} | Ganancia: Bs ${totalGanancia.toFixed(2)}</strong></p>
        ${promoDetailBlocks ? `<h2>Productos consumidos por promoción</h2>${promoDetailBlocks}` : ''}
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

/* Calcula la fecha de 6 días antes de la indicada, para armar una ventana de 7 días (semanal) que
   termina justo en el día programado — ejemplo: si se programó para el domingo, el reporte cubre
   del lunes anterior al domingo, inclusive ambos extremos. */
const getSevenDaysBefore = (fechaFin) => {
  const date = new Date(`${fechaFin}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 6);
  return date.toISOString().slice(0, 10);
};

export const runScheduledReportCheck = async () => {
  const config = await getScheduledReportConfig();
  if (!config.email || config.dia_semana === null || !config.hora) return;

  const bolivianNow = getBoliviaNow();
  const configuredHHMM = config.hora.slice(0, 5);
  const lastScheduledDate = getLastScheduledDate(bolivianNow, config.dia_semana, configuredHHMM);

  const ultimoEnvioStr = config.ultimo_envio instanceof Date ? config.ultimo_envio.toISOString().slice(0, 10) : config.ultimo_envio;
  if (ultimoEnvioStr === lastScheduledDate) return;

  const fechaInicio = getSevenDaysBefore(lastScheduledDate);
  const rows = await getTopProductsReport(fechaInicio, lastScheduledDate);
  const html = buildScheduledReportHtml(rows, fechaInicio, lastScheduledDate);

  try {
    await sendReportPdfEmail(config.email, 'Reporte Semanal Automático', html);
    const existingResult = await query(`SELECT id FROM scheduled_report_config LIMIT 1`);
    await query(`UPDATE scheduled_report_config SET ultimo_envio = $1 WHERE id = $2`, [lastScheduledDate, existingResult.rows[0].id]);
    console.log(`Reporte automático enviado a ${config.email} (semana del ${fechaInicio} al ${lastScheduledDate})`);
  } catch (error) {
    console.error('Error enviando reporte automático:', error.message);
  }
};

/* Envía el reporte semanal de inmediato, sin esperar al día/hora programados — para probar que
   todo funciona (correo, formato) sin tener que ajustar la configuración y esperar. No modifica
   "ultimo_envio", así que no interfiere con el envío automático real programado. */
export const sendScheduledReportTest = async () => {
  const config = await getScheduledReportConfig();
  if (!config.email) throw new Error('NO_EMAIL_CONFIGURED');

  const bolivianNow = getBoliviaNow();
  const fechaFin = bolivianNow.toISOString().slice(0, 10);
  const fechaInicio = getSevenDaysBefore(fechaFin);
  const rows = await getTopProductsReport(fechaInicio, fechaFin);
  const html = buildScheduledReportHtml(rows, fechaInicio, fechaFin);

  await sendReportPdfEmail(config.email, 'Reporte Semanal Automático (prueba)', html);
};
