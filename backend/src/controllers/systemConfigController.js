import { getSystemConfig, updateSystemConfig } from '../services/systemConfigService.js';

/* Devuelve las credenciales de Brevo guardadas (sin exponer la API key completa por seguridad, solo si está configurada o no). */
export const getSystemConfigHandler = async (req, res) => {
  try {
    const config = await getSystemConfig();
    return res.json({
      hasApiKey: Boolean(config.brevo_api_key),
      brevoSenderEmail: config.brevo_sender_email || '',
      brevoSenderName: config.brevo_sender_name || ''
    });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la configuración' });
  }
};

/* Guarda las credenciales de Brevo para el envío de correos. */
export const updateSystemConfigHandler = async (req, res) => {
  const { brevoApiKey, brevoSenderEmail, brevoSenderName } = req.body;
  if (!brevoApiKey || !brevoSenderEmail) {
    return res.status(400).json({ message: 'Complete la API Key y el correo remitente' });
  }
  try {
    await updateSystemConfig(brevoApiKey, brevoSenderEmail, brevoSenderName || 'Cafebar');
    return res.json({ message: 'Configuración de correo guardada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar la configuración' });
  }
};
