import {
  getTaxLink,
  updateTaxLink,
  changeDirectorioPassword,
  getDailySalesSummary,
  listDailySales,
  getDailySaleDetails,
  listCajeroNames
} from '../services/configService.js';
import { getScheduledReportConfig, updateScheduledReportConfig, sendScheduledReportTest } from '../services/scheduledReportService.js';

/* Controlador para obtener el enlace de impuestos */
export const getTaxLinkHandler = async (req, res) => {
  try {
    const enlace = await getTaxLink();
    return res.json({ enlace });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el enlace' });
  }
};

/* Controlador para actualizar el enlace de impuestos */
export const updateTaxLinkHandler = async (req, res) => {
  const { enlace } = req.body;
  if (!enlace || !enlace.trim().startsWith('http')) {
    return res.status(400).json({ message: 'URL inválida' });
  }
  try {
    await updateTaxLink(enlace.trim());
    return res.json({ message: 'El enlace fue actualizado correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar el enlace' });
  }
};

/* Controlador para cambiar la contraseña del usuario DIRECTORIO */
export const changeDirectorioPasswordHandler = async (req, res) => {
  const { actual, nueva } = req.body;
  if (!actual || !nueva) {
    return res.status(400).json({ message: 'Rellene los campos solicitados' });
  }
  if (nueva.length < 4) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 4 caracteres' });
  }
  try {
    await changeDirectorioPassword(actual, nueva);
    return res.json({ message: 'Contraseña del DIRECTORIO actualizada' });
  } catch (error) {
    if (error.message === 'WRONG_PASSWORD') {
      return res.status(400).json({ message: 'Contraseña actual incorrecta' });
    }
    if (error.message === 'DIRECTORIO_NOT_FOUND') {
      return res.status(404).json({ message: 'No se encontró el registro de DIRECTORIO' });
    }
    return res.status(500).json({ message: 'No se pudo cambiar la contraseña' });
  }
};

/* Controlador para obtener el resumen de ventas del día */
export const getDailySalesSummaryHandler = async (req, res) => {
  try {
    const summary = await getDailySalesSummary();
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el resumen de ventas' });
  }
};

/* Controlador para listar las ventas del día */
export const listDailySalesHandler = async (req, res) => {
  const { filtro, busqueda } = req.query;
  try {
    const sales = await listDailySales(filtro, busqueda);
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener las ventas del día' });
  }
};

/* Controlador para obtener el detalle de una venta */
export const getDailySaleDetailsHandler = async (req, res) => {
  try {
    const details = await getDailySaleDetails(req.params.idVenta);
    return res.json(details);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el detalle de la venta' });
  }
};

/* Controlador para listar los nombres de los cajeros */
export const listCajeroNamesHandler = async (req, res) => {
  try {
    const nombres = await listCajeroNames();
    return res.json(nombres);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener cajeros' });
  }
};

/* Controlador para obtener la configuración actual del reporte automático semanal (correo, día y hora). */
export const getScheduledReportConfigHandler = async (req, res) => {
  try {
    const config = await getScheduledReportConfig();
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener la configuración del reporte automático' });
  }
};

/* Controlador para actualizar el correo, día y hora en que se envía el reporte automático semanal. */
export const updateScheduledReportConfigHandler = async (req, res) => {
  const { email, diaSemana, hora } = req.body;
  try {
    await updateScheduledReportConfig(email, diaSemana, hora);
    return res.json({ message: 'Configuración guardada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar la configuración' });
  }
};

/* Controlador para enviar el reporte semanal inmediatamente y verificar su funcionamiento. */
export const sendScheduledReportTestHandler = async (req, res) => {
  try {
    await sendScheduledReportTest();
    return res.json({ message: 'Reporte de prueba enviado correctamente' });
  } catch (error) {
    if (error.message === 'NO_EMAIL_CONFIGURED') {
      return res.status(400).json({ message: 'Primero configura y guarda un correo de destino' });
    }
    return res.status(500).json({ message: 'No se pudo enviar el reporte de prueba. Revisa que el correo esté bien configurado en Configurar Envío de Correos.' });
  }
};
