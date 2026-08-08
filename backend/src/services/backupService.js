import {supabase} from '../config/supabaseClient.js';
import * as XLSX from 'xlsx';
import {sendBackupEmailViaBrevo} from './emailService.js';

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

/* Genera un archivo Excel con la información completa de la base de datos */
export const exportDatabaseToExcel = async () => {
  const workbook = XLSX.utils.book_new();
  for (const tabla of TABLE_ORDER) {
    const {data} = await supabase.from(tabla).select('*');
    const rows = data && data.length > 0 ? data : [{}];
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, tabla.slice(0, 31));
  }
  return XLSX.write(workbook, {type: 'buffer', bookType: 'xlsx'});
};

/* Restaura la base de datos a partir de un archivo Excel de respaldo */
export const importDatabaseFromExcel = async (buffer) => {
  const workbook = XLSX.read(buffer, {type: 'buffer'});
  const deleteOrder = [...TABLE_ORDER].reverse();
  for (const tabla of deleteOrder) {
    const sheetName = findSheetName(workbook, tabla);
    if (!sheetName) {
      continue;
    }
    const {error} = await supabase.rpc('admin_truncate_table', {target_table: tabla});
    if (error) throw new Error(`IMPORT_DELETE_FAILED:${tabla}:${error.message}`);
  }
  for (const tabla of TABLE_ORDER) {
    const sheetName = findSheetName(workbook, tabla);
    if (!sheetName) continue;
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet,{defval: null});
    if (rows.length === 0) {
      continue;
    }
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const {error} = await supabase.from(tabla).insert(chunk);
      if (error) throw new Error(`IMPORT_INSERT_FAILED:${tabla}:${error.message}`);
    }
    const {error: resetError} = await supabase.rpc('admin_reset_sequence', {target_table: tabla});
    if (resetError) {
      console.error(`No se pudo reiniciar la secuencia de ${tabla}:`, resetError.message);
    }
  }
};

/* Genera un respaldo de la base de datos y lo envía por correo electrónico */
export const sendBackupByEmail = async (correoDestino) => {
  const buffer = await exportDatabaseToExcel();
  await sendBackupEmailViaBrevo(correoDestino, Buffer.from(buffer));
};