import { query } from '../config/db.js';
import { listPrinters as listWindowsPrinters, printText } from '../utils/printers.js';

/* Obtiene la lista de impresoras instaladas en esta computadora. */
export const getAvailablePrinters = async () => listWindowsPrinters();

/* Obtiene la asignación actual de impresoras (cuál va para Ticket y cuál para Cocina). */
export const getPrinterAssignment = async () => {
  const result = await query(`SELECT ticket_printer, cocina_printer FROM printer_config LIMIT 1`);
  return result.rows[0] || { ticket_printer: '', cocina_printer: '' };
};

/* Guarda la asignación de impresoras para Ticket y Cocina. */
export const savePrinterAssignment = async (ticketPrinter, cocinaPrinter) => {
  const existingResult = await query(`SELECT id FROM printer_config LIMIT 1`);
  const existing = existingResult.rows[0];
  if (existing) {
    await query(`UPDATE printer_config SET ticket_printer = $1, cocina_printer = $2 WHERE id = $3`, [ticketPrinter, cocinaPrinter, existing.id]);
  } else {
    await query(`INSERT INTO printer_config (ticket_printer, cocina_printer) VALUES ($1, $2)`, [ticketPrinter, cocinaPrinter]);
  }
};

/* Envía un ticket o comanda a la impresora asignada según el tipo indicado (ticket o cocina). */
export const printOrder = async (tipo, text) => {
  const assignment = await getPrinterAssignment();
  const printerName = tipo === 'cocina' ? assignment.cocina_printer : assignment.ticket_printer;
  if (!printerName) throw new Error(`NO_PRINTER_CONFIGURED:${tipo}`);
  await printText(printerName, text);
};
