import { getAvailablePrinters, getPrinterAssignment, savePrinterAssignment, printOrder } from '../services/printerService.js';

/* Controlador para devolver la lista de impresoras instaladas en esta computadora. */
export const listPrintersHandler = async (req, res) => {
  try {
    const printers = await getAvailablePrinters();
    return res.json(printers);
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la lista de impresoras', error: error.message });
  }
};

/* Controlador para devolver la asignación actual de impresoras. */
export const getPrinterAssignmentHandler = async (req, res) => {
  try {
    const assignment = await getPrinterAssignment();
    return res.json({ ticketPrinter: assignment.ticket_printer, cocinaPrinter: assignment.cocina_printer });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo obtener la configuración de impresoras' });
  }
};

/* Controlador para guardar la asignación de impresoras para Ticket y Cocina. */
export const savePrinterAssignmentHandler = async (req, res) => {
  const { ticketPrinter, cocinaPrinter } = req.body;
  try {
    await savePrinterAssignment(ticketPrinter || '', cocinaPrinter || '');
    return res.json({ message: 'Configuración guardada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo guardar la configuración' });
  }
};

/* Controlador para recibir un pedido de impresión (ticket o cocina) y lo envía a la impresora correspondiente. */
export const printOrderHandler = async (req, res) => {
  const { tipo, text } = req.body;
  if (!tipo || !text) return res.status(400).json({ message: 'Faltan datos para imprimir' });
  try {
    await printOrder(tipo, text);
    return res.json({ message: 'Impreso correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al imprimir', error: error.message });
  }
};
