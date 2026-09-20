import { api } from '../../../lib/api';

export const getSectionsWithTables = async () => {
  const { data } = await api.get('/pos/sections');
  return data;
};

export const getNextSaleNumber = async () => {
  const { data } = await api.get('/pos/next-sale-number');
  return data.numVenta;
};

export const getEmployeesForPos = async () => {
  const { data } = await api.get('/employees/pos-list');
  return data;
};

export const getPromotionsForPos = async () => {
  const { data } = await api.get('/promotions/catalog-pos');
  return data;
};

export const submitOrder = async (payload) => {
  const { data } = await api.post('/pos/orders', payload);
  return data;
};

export const getPendingBatches = async (idSeccion, idMesa) => {
  const { data } = await api.get(`/pos/tables/${idSeccion}/${idMesa}/pending-batches`);
  return data;
};

export const getMarkCards = async (fecha) => {
  const { data } = await api.get('/pos/mark-cards', { params: { fecha } });
  return data;
};

/* NOTA: función completa y funcional (ruta + controller + service en el backend ya existen),
   pero ningún componente del frontend la usa todavía. Marca una sola unidad a la vez — parece haber
   quedado reemplazada por applyMarkChanges (marca/desmarca varias unidades de una sola vez, más
   eficiente, usada actualmente por Marcar Pendientes). Se deja por si sirve a futuro. */
export const markUnits = async (unitIds, marcado) => {
  const { data } = await api.put('/pos/units/mark', { unitIds, marcado });
  return data;
};

export const getOrderTicket = async (idVenta) => {
  const { data } = await api.get(`/pos/orders/${idVenta}/ticket`);
  return data;
};

export const getKitchenTicket = async (idVenta, fecha) => {
  const { data } = await api.get(`/pos/orders/${idVenta}/kitchen-ticket`, { params: { fecha } });
  return data;
};

export const verifyPassword = async (password) => {
  const { data } = await api.post('/pos/verify-password', { password });
  return data;
};

export const getLatestOrderId = async (idSeccion, idMesa) => {
  const { data } = await api.get(`/pos/tables/${idSeccion}/${idMesa}/latest-order`);
  return data.idVenta;
};

export const getUnmarkedCount = async (idSeccion, idMesa) => {
  const { data } = await api.get(`/pos/tables/${idSeccion}/${idMesa}/unmarked-count`);
  return data.count;
};

export const checkoutOrder = async (idVenta, payload) => {
  const { data } = await api.post(`/pos/orders/${idVenta}/checkout`, payload);
  return data;
};

export const getPromotionProductsIngredients = async (idProm) => {
  const { data } = await api.get(`/promotions/${idProm}/products-ingredients`);
  return data;
};

export const applyMarkChanges = async (markIds, unmarkIds) => {
  const { data } = await api.put('/pos/units/mark-batch', { markIds, unmarkIds });
  return data;
};

export const getTaxLink = async () => {
  const { data } = await api.get('/pos/tax-link');
  return data.enlace;
};