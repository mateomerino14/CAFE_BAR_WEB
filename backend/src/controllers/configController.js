import {
  getTaxLink, 
  updateTaxLink, 
  changeDirectorioPassword,
  getDailySalesSummary,
  listDailySales, 
  getDailySaleDetails, 
  listCajeroNames,
  getPrintAgentUrl,
  updatePrintAgentUrl
} from '../services/configService.js';

/* Controlador para obtener el enlace de impuestos */
export const getTaxLinkHandler = async (req, res) => {
  try {
    const enlace = await getTaxLink();
    return res.json({ enlace });
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el enlace'});
  }
};

/* Controlador para actualizar el enlace de impuestos */
export const updateTaxLinkHandler = async (req, res) => {
  const {enlace} = req.body;
  if (!enlace || !enlace.trim().startsWith('http')) {
    return res.status(400).json({message: 'URL inválida'});
  }
  try {
    await updateTaxLink(enlace.trim());
    return res.json({message: 'El enlace fue actualizado correctamente'});
  } 
  catch (error) {
    return res.status(500).json({message: 'No se pudo actualizar el enlace'});
  }
};

/* Controlador para cambiar la contraseña del usuario DIRECTORIO */
export const changeDirectorioPasswordHandler = async (req, res) => {
  const {actual,nueva} = req.body;
  if (!actual || !nueva) {
    return res.status(400).json({message: 'Rellene los campos solicitados'});
  }
  if (nueva.length < 4) {
    return res.status(400).json({message: 'La contraseña debe tener al menos 4 caracteres'});
  }
  try {
    await changeDirectorioPassword(actual, nueva);
    return res.json({message: 'Contraseña del DIRECTORIO actualizada'});
  } 
  catch (error) {
    if (error.message === 'WRONG_PASSWORD') {
      return res.status(400).json({message: 'Contraseña actual incorrecta'});
    }
    if (error.message === 'DIRECTORIO_NOT_FOUND') {
      return res.status(404).json({message: 'No se encontró el registro de DIRECTORIO'});
    }
    return res.status(500).json({message: 'No se pudo cambiar la contraseña'});
  }
};


/* Controlador para obtener el resumen de ventas del día */
export const getDailySalesSummaryHandler = async (req, res) => {
  try {
    const summary = await getDailySalesSummary();
    return res.json(summary);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el resumen de ventas'});
  }
};

/* Controlador para listar las ventas del día */
export const listDailySalesHandler = async (req, res) => {
  const {filtro, busqueda} = req.query;
  try {
    const sales = await listDailySales(filtro, busqueda);
    return res.json(sales);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener las ventas del día'});
  }
};

/* Controlador para obtener el detalle de una venta */
export const getDailySaleDetailsHandler = async (req, res) => {
  try {
    const details = await getDailySaleDetails(req.params.idVenta);
    return res.json(details);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el detalle de la venta'});
  }
};

/* Controlador para listar los nombres de los cajeros */
export const listCajeroNamesHandler = async (req, res) => {
  try {
    const nombres = await listCajeroNames();
    return res.json(nombres);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener cajeros'});
  }
};

/* Obtiene la dirección configurada del servicio de impresión y la retorna al cliente. */
export const getPrintAgentUrlHandler = async (req, res) => {
  try {
    const url = await getPrintAgentUrl();
    return res.json({url});
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener la dirección del servicio de impresión'});
  }
};

/* Actualiza y guarda la dirección del servicio de impresión proporcionada por el cliente. */
export const updatePrintAgentUrlHandler = async (req, res) => {
  const {url} = req.body;
  try {
    await updatePrintAgentUrl((url || '').trim());
    return res.json({message: 'Dirección guardada correctamente'});
  } 
  catch (error) {
    return res.status(500).json({message: 'No se pudo guardar la dirección'});
  }
};