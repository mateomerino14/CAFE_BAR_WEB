import { query } from '../config/db.js';
import * as XLSX from 'xlsx';
import { sendBackupEmailViaBrevo } from './emailService.js';

/* Orden de tablas utilizado para exportar e importar la base de datos respetando dependencias */
const TABLE_ORDER = [
  'pantalla', 'subpantalla', 'cargo', 'permisos_cargo_subpantalla', 'empleado', 'password_reset_codes',
  'directorio', 'categoria', 'subcategoria', 'stock', 'producto', 'productos_ingredientes',
  'promocion', 'promocion_dias', 'promocion_prod', 'seccion', 'mesa', 'metodo_pago',
  'venta', 'detalles_venta', 'detalles_venta_unidades', 'detalles_venta_exclusiones',
  'detalles_venta_exclusiones_promo', 'detalles_venta_extras', 'pago', 'enlace'
];

/* Busca el nombre de una hoja dentro del archivo Excel correspondiente a una tabla */
const findSheetName = (workbook, tabla) =>
  workbook.SheetNames.find((s) => s === tabla || s === tabla.slice(0, 31));

/* Envuelve un nombre de tabla o columna entre comillas dobles para usarlo de forma segura en SQL dinámico */
const quoteIdent = (name) => `"${name.replace(/"/g, '""')}"`;

/* Genera un archivo Excel con la información completa de la base de datos */
export const exportDatabaseToExcel = async () => {
  const workbook = XLSX.utils.book_new();
  for (const tabla of TABLE_ORDER) {
    const result = await query(`SELECT * FROM ${quoteIdent(tabla)}`);
    const rows = result.rows.length > 0 ? result.rows : [{}];
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, tabla.slice(0, 31));
  }
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};

/* Restaura la base de datos a partir de un archivo Excel de respaldo */
export const importDatabaseFromExcel = async (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const deleteOrder = [...TABLE_ORDER].reverse();
  for (const tabla of deleteOrder) {
    const sheetName = findSheetName(workbook, tabla);
    if (!sheetName) continue;
    try {
      await query(`SELECT admin_truncate_table($1)`, [tabla]);
    } catch (error) {
      throw new Error(`IMPORT_DELETE_FAILED:${tabla}:${error.message}`);
    }
  }

  for (const tabla of TABLE_ORDER) {
    const sheetName = findSheetName(workbook, tabla);
    if (!sheetName) continue;
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    if (rows.length === 0) continue;

    const columns = Object.keys(rows[0]);
    const columnList = columns.map(quoteIdent).join(', ');

    for (const row of rows) {
      const values = columns.map((col) => row[col]);
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      try {
        await query(`INSERT INTO ${quoteIdent(tabla)} (${columnList}) VALUES (${placeholders})`, values);
      } catch (error) {
        throw new Error(`IMPORT_INSERT_FAILED:${tabla}:${error.message}`);
      }
    }

    try {
      await query(`SELECT admin_reset_sequence($1)`, [tabla]);
    } catch (error) {
      console.error(`No se pudo reiniciar la secuencia de ${tabla}:`, error.message);
    }
  }
};

/* Genera un respaldo de la base de datos y lo envía por correo electrónico */
export const sendBackupByEmail = async (correoDestino) => {
  const buffer = await exportDatabaseToExcel();
  await sendBackupEmailViaBrevo(correoDestino, Buffer.from(buffer));
};
