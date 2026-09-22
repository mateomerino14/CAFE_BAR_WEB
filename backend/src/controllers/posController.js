import {getTaxLink} from '../services/configService.js';
import {listSectionsWithTables, createOrGetVenta,
  addOrderItems,
  computeStockRequirements,
  deductStock,
  listPendingBatches,
  getMarkCards,
  markUnits,
  applyMarkChanges,
  getOrderTicket,
  getKitchenTicket,
  verifyOwnPassword,
  getLatestVentaId,
  getOpenVentaSummary,
  countUnmarkedUnits,
  checkoutOrder,
  getNextSaleNumberPreview
} from '../services/posService.js';
import {isValidDecimal} from '../utils/validators.js';

/* Controlador para listar las secciones con sus mesas */
export const listSectionsWithTablesHandler = async (req, res) => {
  try {
    const sections = await listSectionsWithTables();
    return res.json(sections);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener secciones y mesas'});
  }
};

/* Controlador para registrar un nuevo pedido */
export const createOrderHandler = async (req, res) => {
  const {idMesa, idSeccion, idMesero, items} = req.body;
  if (!idMesa || !idSeccion || !idMesero) {
    return res.status(400).json({message: 'Rellene los campos solicitados'});
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({message: 'Debe contener por lo menos un producto la venta'});
  }
  try {
    const neededByIngredient = await computeStockRequirements(items);
    const idCajero = req.user.isDirectorio ? null : req.user.codEmp;
    const { idVenta, numVenta } = await createOrGetVenta({idMesa, idSeccion, idMesero, idCajero});
    const batchFecha = new Date().toISOString();
    const total = await addOrderItems(idVenta, idMesero, items, batchFecha);
    await deductStock(neededByIngredient);
    return res.status(201).json({message: 'Venta registrada con éxito', idVenta, numVenta, total, batchFecha});
  } 
  catch (error){
    console.error(error);
    if (error.message === 'PRODUCT_NOT_FOUND' || error.message === 'PROMOTION_NOT_FOUND') {
      return res.status(400).json({message: 'Uno de los ítems ya no existe'});
    }
    return res.status(500).json({message: 'No se pudo registrar la venta'});
  }
};

/* Controlador para listar los pedidos pendientes de una mesa */
export const listPendingBatchesHandler = async (req, res) => {
  try {
    const batches = await listPendingBatches(req.params.idMesa, req.params.idSeccion);
    return res.json(batches);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener los pedidos pendientes'});
  }
};

/* Controlador para obtener las tarjetas de marcado de productos */
export const getMarkCardsHandler = async (req, res) => {
  try {
    const cards = await getMarkCards(req.query.fecha);
    return res.json(cards);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al obtener los productos para marcar'});
  }
};

/* Controlador para marcar o desmarcar unidades de productos */
export const markUnitsHandler = async (req, res) => {
  const { unitIds, marcado } = req.body;
  if (!Array.isArray(unitIds) || unitIds.length === 0) {
    return res.status(400).json({message: 'No se especificaron unidades'});
  }
  try {
    await markUnits(unitIds, marcado);
    return res.json({message: 'Actualizado correctamente'});
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'No se pudo actualizar el estado'});
  }
};

/* Controlador para obtener el ticket de una venta */
export const getOrderTicketHandler = async (req, res) => {
  try {
    const ticket = await getOrderTicket(req.params.id);
    if (!ticket) {
      return res.status(404).json({message: 'Venta no encontrada'});
    }
    return res.json(ticket);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el ticket'});
  }
};

/* Controlador para obtener el ticket de cocina de una venta */
export const getKitchenTicketHandler = async (req, res) => {
  try {
    const ticket = await getKitchenTicket(req.params.id, req.query.fecha);
    if (!ticket) {
      return res.status(404).json({message: 'Venta no encontrada'});
    }
    return res.json(ticket);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al obtener el pedido de cocina'});
  }
};

/* Controlador para verificar la contraseña del usuario autenticado */
export const verifyPasswordHandler = async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({message: 'Ingrese su contraseña'});
  }
  try {
    const valid = await verifyOwnPassword(req.user, password);
    return res.json({ valid });
  } 
  catch (error) {
    return res.status(500).json({message: 'No se pudo verificar la contraseña'});
  }
};

/* Controlador para obtener el identificador de la venta abierta de una mesa */
export const getLatestOrderIdHandler = async (req, res) => {
  try {
    const idVenta = await getLatestVentaId(req.params.idMesa, req.params.idSeccion);
    if (!idVenta) {
      return res.status(404).json({message: 'No hay una venta abierta para esta mesa'});
    }
    return res.json({ idVenta });
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener la venta'});
  }
};

/* Controlador para obtener el resumen (id + número real) de la venta abierta de una mesa, si existe */
export const getOpenVentaSummaryHandler = async (req, res) => {
  try {
    const summary = await getOpenVentaSummary(req.params.idMesa, req.params.idSeccion);
    return res.json(summary);
  } catch (error) {
    return res.status(500).json({message: 'Error al obtener el resumen de la venta'});
  }
};

/* Controlador para obtener la cantidad de unidades pendientes de marcar */
export const getUnmarkedCountHandler = async (req, res) => {
  try {
    const count = await countUnmarkedUnits(req.params.idMesa, req.params.idSeccion);
    return res.json({count});
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al verificar unidades pendientes'});
  }
};

/* Controlador para registrar el pago de una venta */
export const checkoutOrderHandler = async (req, res) => {
  const {metodo, montoEfectivo, montoQr} = req.body;
  if (!metodo) {
    return res.status(400).json({message: 'Seleccione un método de pago'});
  }
  if ((metodo === 'efectivo' || metodo === 'mixto') && !isValidDecimal(String(montoEfectivo))) {
    return res.status(400).json({message: 'El monto en efectivo debe ser un valor numérico válido'});
  }
  if ((metodo === 'qr' || metodo === 'mixto') && !isValidDecimal(String(montoQr))) {
    return res.status(400).json({message: 'El monto en QR debe ser un valor numérico válido'});
  }
  try {
    await checkoutOrder(req.params.id, {metodo, montoEfectivo, montoQr});
    return res.json({message: 'Pago registrado correctamente'});
  } 
  catch (error){
    if (typeof error.message === 'string' && error.message.startsWith('UNMARKED_UNITS:')) {
      return res.status(400).json({message: `Esta mesa tiene ${error.message.split(':')[1]} unidad(es) sin marcar como listas`});
    }
    if (error.message === 'AMOUNT_MISMATCH') {
      return res.status(400).json({message: 'El monto ingresado no coincide con el total'});
    }
    if (error.message === 'ORDER_NOT_FOUND') {
      return res.status(404).json({message: 'Venta no encontrada'});
    }
    console.error(error);
    return res.status(500).json({message: 'No se pudo registrar el pago'});
  }
};

/* Controlador para obtener el siguiente número de venta */
export const getNextSaleNumberHandler = async (req, res) => {
  try {
    const numVenta = await getNextSaleNumberPreview();
    return res.json({numVenta});
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el número de venta'});
  }
};

/* Controlador para aplicar cambios en el marcado de unidades */
export const applyMarkChangesHandler = async (req, res) => {
  const {markIds = [], unmarkIds = []} = req.body;
  try {
    await applyMarkChanges(markIds, unmarkIds);
    return res.json({message: 'Actualizado correctamente'});
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'No se pudo actualizar el estado'});
  }
};

/* Controlador para obtener el enlace de consulta de impuestos para caja */
export const getTaxLinkForCajaHandler = async (req, res) => {
  try {
    const enlace = await getTaxLink();
    return res.json({enlace});
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el enlace'});
  }
};