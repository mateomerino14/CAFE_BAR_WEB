import { api } from '../../../lib/api';

/* Obtiene la lista de impresoras instaladas en esta computadora. */
export const getPrinters = async () => {
  const { data } = await api.get('/printers');
  return data;
};

/* Obtiene la asignación actual de impresoras (Ticket y Cocina). */
export const getPrinterAssignment = async () => {
  const { data } = await api.get('/printers/config');
  return data;
};

/* Guarda la asignación de impresoras para Ticket y Cocina. */
export const savePrinterAssignment = async (ticketPrinter, cocinaPrinter) => {
  const { data } = await api.put('/printers/config', { ticketPrinter, cocinaPrinter });
  return data;
};

/* Envía un pedido de impresión (ticket o cocina) a la impresora asignada correspondiente. */
export const sendPrintJob = async (tipo, text) => {
  const { data } = await api.post('/printers/print', { tipo, text });
  return data;
};
