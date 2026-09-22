import puppeteer from 'puppeteer';
import { getSystemConfig } from './systemConfigService.js';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BRAND_BLUE = '#2563eb';
const BRAND_BLUE_DARK = '#1e3a8a';

/* Envía correos mediante la API de Brevo usando las credenciales de Configuración */
const sendViaBrevo = async (payload) => {
  const config = await getSystemConfig();
  if (!config.brevo_api_key) {
    throw new Error('BREVO_NOT_CONFIGURED');
  }
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.brevo_api_key
    },
    body: JSON.stringify({
      sender: { name: config.brevo_sender_name || 'Cafebar', email: config.brevo_sender_email },
      ...payload
    })
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`BREVO_SEND_FAILED:${errorBody}`);
  }
};

/* Envía al usuario un código de verificación por correo electrónico para permitir la recuperación de su contraseña */
export const sendResetCodeEmail = async (toEmail, toName, code) => {
  await sendViaBrevo({
    to: [{ email: toEmail, name: toName }],
    subject: 'Código de verificación - Cafebar',
    htmlContent: `
      <div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:32px 16px;">
        <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%);padding:24px;text-align:center;">
            <p style="margin:0;color:#dbeafe;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Cafebar</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">Recuperación de contraseña</h1>
          </div>
          <div style="padding:32px 24px;text-align:center;">
            <p style="margin:0 0 20px;color:#334155;font-size:14px;">Hola ${toName || ''}, usa este código para restablecer tu contraseña:</p>
            <div style="display:inline-block;background:#eff6ff;border:2px solid ${BRAND_BLUE};border-radius:12px;padding:16px 28px;">
              <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:${BRAND_BLUE_DARK};">${code}</span>
            </div>
            <p style="margin:20px 0 0;color:#64748b;font-size:12px;">Este código expira en 10 minutos. Si no solicitaste esto, puedes ignorar el mensaje.</p>
          </div>
        </div>
      </div>
    `
  });
};

/* Envía por correo electrónico un respaldo de la base de datos como archivo Excel adjunto */
export const sendBackupEmailViaBrevo = async (correoDestino, attachmentBuffer) => {
  await sendViaBrevo({
    to: [{ email: correoDestino }],
    subject: 'Backup Cafebar',
    htmlContent: `
      <div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:32px 16px;">
        <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%);padding:24px;text-align:center;">
            <p style="margin:0;color:#dbeafe;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Cafebar</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">Backup de la base de datos</h1>
          </div>
          <div style="padding:28px 24px;text-align:center;">
            <p style="margin:0;color:#334155;font-size:14px;">Adjunto encontrarás el respaldo completo en formato Excel.</p>
          </div>
        </div>
      </div>
    `,
    attachment: [{ content: attachmentBuffer.toString('base64'), name: 'backup_cafebar.xlsx' }]
  });
};

/* Genera un archivo PDF a partir de contenido HTML utilizando Puppeteer, con el Chromium normal instalado junto a la app de escritorio */
const generatePdfBuffer = async (htmlContent) => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBytes = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '15mm', left: '10mm', right: '10mm' }
    });
    return Buffer.from(pdfBytes);
  } finally {
    await browser.close();
  }
};

/* Genera un reporte PDF a partir del contenido HTML y lo envía por correo electrónico como archivo adjunto mediante Brevo */
export const sendReportPdfEmail = async (correoDestino, titulo, htmlContent) => {
  const pdfBuffer = await generatePdfBuffer(htmlContent);
  const nombreArchivo = `${titulo.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`;
  await sendViaBrevo({
    to: [{ email: correoDestino }],
    subject: `${titulo} — Cafebar`,
    htmlContent: `
      <div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:32px 16px;">
        <div style="max-width:420px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_BLUE_DARK} 100%);padding:24px;text-align:center;">
            <p style="margin:0;color:#dbeafe;font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">Cafebar — Reportes</p>
            <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">${titulo}</h1>
          </div>
          <div style="padding:28px 24px;text-align:center;">
            <p style="margin:0;color:#334155;font-size:14px;">Adjunto encontrarás el reporte solicitado en formato PDF.</p>
          </div>
        </div>
      </div>
    `,
    attachment: [{ content: pdfBuffer.toString('base64'), name: nombreArchivo }]
  });
};
