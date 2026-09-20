import { query } from '../config/db.js';

/* Obtiene las credenciales de Brevo guardadas en la base de datos para el envío de correos. */
export const getSystemConfig = async () => {
  const result = await query(`SELECT brevo_api_key, brevo_sender_email, brevo_sender_name FROM system_config LIMIT 1`);
  return result.rows[0] || { brevo_api_key: '', brevo_sender_email: '', brevo_sender_name: '' };
};

/* Guarda o actualiza las credenciales de Brevo utilizadas para el envío de correos. */
export const updateSystemConfig = async (apiKey, senderEmail, senderName) => {
  const existingResult = await query(`SELECT id FROM system_config LIMIT 1`);
  const existing = existingResult.rows[0];
  if (existing) {
    await query(
      `UPDATE system_config SET brevo_api_key = $1, brevo_sender_email = $2, brevo_sender_name = $3 WHERE id = $4`,
      [apiKey, senderEmail, senderName, existing.id]
    );
  } else {
    await query(
      `INSERT INTO system_config (brevo_api_key, brevo_sender_email, brevo_sender_name) VALUES ($1, $2, $3)`,
      [apiKey, senderEmail, senderName]
    );
  }
};
