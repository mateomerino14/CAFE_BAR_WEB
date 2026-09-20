import { query } from '../config/db.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

/* Obtiene el enlace configurado del sistema tributario o devuelve el enlace predeterminado si no existe. */
export const getTaxLink = async () => {
  const result = await query(`SELECT enlace FROM enlace LIMIT 1`);
  return result.rows[0]?.enlace || 'https://siat.impuestos.gob.bo/v2/launcher/';
};

/* Actualiza el enlace del sistema tributario existente o crea uno nuevo si todavía no está registrado. */
export const updateTaxLink = async (enlace) => {
  const existingResult = await query(`SELECT id_enlace FROM enlace LIMIT 1`);
  const existing = existingResult.rows[0];
  if (existing) {
    await query(`UPDATE enlace SET enlace = $1 WHERE id_enlace = $2`, [enlace, existing.id_enlace]);
  } else {
    await query(`INSERT INTO enlace (enlace) VALUES ($1)`, [enlace]);
  }
};

/* Verifica la contraseña actual del usuario DIRECTORIO y actualiza su contraseña por una nueva. */
export const changeDirectorioPassword = async (actual, nueva) => {
  const result = await query(`SELECT id_admin, contrasena_admin FROM directorio LIMIT 1`);
  const data = result.rows[0];
  if (!data) throw new Error('DIRECTORIO_NOT_FOUND');
  const valid = await verifyPassword(actual, data.contrasena_admin);
  if (!valid) throw new Error('WRONG_PASSWORD');
  const hashed = await hashPassword(nueva);
  await query(`UPDATE directorio SET contrasena_admin = $1 WHERE id_admin = $2`, [hashed, data.id_admin]);
};

/* Calcula el rango de fechas correspondiente al día actual en Bolivia para realizar consultas sobre las ventas del día. */
const getTodayBoliviaRange = () => {
  const now = new Date();
  const shifted = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth();
  const day = shifted.getUTCDate();
  const start = new Date(Date.UTC(year, month, day, 4, 0, 0, 0));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
};

/* Obtiene el estado general de cada venta a partir del estado de sus detalles. */
const getVentaEstados = async (ventaIds) => {
  if (ventaIds.length === 0) return new Map();
  const result = await query(
    `SELECT id_venta, estado_detalle_venta FROM detalles_venta WHERE id_venta = ANY($1::bigint[])`,
    [ventaIds]
  );
  const estadoByVenta = new Map();
  for (const d of result.rows) {
    if (d.estado_detalle_venta === 'PENDIENTE') {
      estadoByVenta.set(d.id_venta, 'En Preparación');
    } else if (!estadoByVenta.has(d.id_venta)) {
      estadoByVenta.set(d.id_venta, 'Finalizada');
    }
  }
  return estadoByVenta;
};

/* Obtiene un resumen de las ventas del día, clasificándolas entre finalizadas y en preparación. */
export const getDailySalesSummary = async () => {
  const { start, end } = getTodayBoliviaRange();
  const result = await query(
    `SELECT id_venta, total_venta FROM venta WHERE fecha_reg >= $1 AND fecha_reg < $2`,
    [start, end]
  );
  const ventaIds = result.rows.map((v) => v.id_venta);
  const estadoByVenta = await getVentaEstados(ventaIds);

  let finalizadas = 0;
  let montoFinalizado = 0;
  let enPreparacion = 0;
  for (const venta of result.rows) {
    const estado = estadoByVenta.get(venta.id_venta) || 'Finalizada';
    if (estado === 'Finalizada') {
      finalizadas += 1;
      montoFinalizado += Number(venta.total_venta);
    } else {
      enPreparacion += 1;
    }
  }
  return { finalizadas, montoFinalizado, enPreparacion, total: result.rows.length };
};

/* Lista las ventas del día con información de empleados, estado, mesa y total, permitiendo filtrar y buscar por cajero. */
export const listDailySales = async (filtro, busqueda) => {
  const { start, end } = getTodayBoliviaRange();
  const ventasResult = await query(
    `SELECT v.id_venta, v.num_venta, v.hora_reg, v.id_mesa, v.total_venta, v.cod_emp, v.cod_emp2, s.nomb_seccion
     FROM venta v
     LEFT JOIN seccion s ON s.id_seccion = v.id_seccion
     WHERE v.fecha_reg >= $1 AND v.fecha_reg < $2 ORDER BY v.hora_reg DESC`,
    [start, end]
  );
  if (ventasResult.rows.length === 0) return [];

  const ventaIds = ventasResult.rows.map((v) => v.id_venta);
  const estadoByVenta = await getVentaEstados(ventaIds);
  const empleadoIds = [...new Set(ventasResult.rows.flatMap((v) => [v.cod_emp, v.cod_emp2]).filter(Boolean))];
  const empleadosResult = empleadoIds.length
    ? await query(`SELECT cod_emp, alias_emp FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [empleadoIds])
    : { rows: [] };
  const aliasById = new Map(empleadosResult.rows.map((e) => [e.cod_emp, e.alias_emp]));

  let result = ventasResult.rows.map((v) => ({
    idVenta: v.id_venta,
    numVenta: v.num_venta,
    hora: v.hora_reg,
    meseroApertura: aliasById.get(v.cod_emp) || '—',
    cajero: v.cod_emp2 ? (aliasById.get(v.cod_emp2) || '—') : 'DIRECTORIO',
    total: v.total_venta,
    mesa: v.id_mesa,
    seccion: v.nomb_seccion || 'N/A',
    estado: estadoByVenta.get(v.id_venta) || 'Finalizada'
  }));

  if (filtro === 'Finalizadas') result = result.filter((r) => r.estado === 'Finalizada');
  if (filtro === 'En preparación') result = result.filter((r) => r.estado === 'En Preparación');
  if (busqueda) {
    const term = busqueda.toLowerCase();
    result = result.filter((r) => r.cajero.toLowerCase().includes(term));
  }
  return result;
};

/* Agrupa las personalizaciones de los productos de una promoción según sus exclusiones y extras. */
const buildPromoBreakdown = async (idDetalleVenta, idProd) => {
  const exclusionResult = await query(
    `SELECT nom_ing, num_unidad FROM detalles_venta_exclusiones_promo WHERE id_detalle_venta = $1 AND id_prod = $2`,
    [idDetalleVenta, idProd]
  );
  const extraResult = await query(
    `SELECT nom_ing, cantidad_extra, num_unidad FROM detalles_venta_extras WHERE id_detalle_venta = $1 AND id_prod = $2`,
    [idDetalleVenta, idProd]
  );

  const exclusionsByUnit = new Map();
  for (const row of exclusionResult.rows) {
    if (!exclusionsByUnit.has(row.num_unidad)) exclusionsByUnit.set(row.num_unidad, []);
    exclusionsByUnit.get(row.num_unidad).push(row.nom_ing);
  }
  const extrasByUnit = new Map();
  for (const row of extraResult.rows) {
    if (row.num_unidad === null || row.num_unidad === undefined) continue;
    if (!extrasByUnit.has(row.num_unidad)) extrasByUnit.set(row.num_unidad, []);
    extrasByUnit.get(row.num_unidad).push(`+${row.cantidad_extra} ${row.nom_ing}`);
  }

  const customizedUnits = new Set([...exclusionsByUnit.keys(), ...extrasByUnit.keys()]);
  const groups = new Map();
  for (const unit of customizedUnits) {
    const exclusiones = (exclusionsByUnit.get(unit) || []).slice().sort();
    const extras = (extrasByUnit.get(unit) || []).slice().sort();
    const key = `${exclusiones.join(',')}|${extras.join(',')}`;
    if (!groups.has(key)) groups.set(key, { cantidad: 0, exclusiones, extras });
    groups.get(key).cantidad += 1;
  }
  return Array.from(groups.values()).filter((g) => g.exclusiones.length || g.extras.length);
};

/* Obtiene las personalizaciones, exclusiones y extras asociados a un detalle de venta o a los productos de una promoción. */
const buildPersonalizacionDetalle = async (det) => {
  if (det.id_prod) {
    const exclusionsResult = await query(`SELECT nom_ing FROM detalles_venta_exclusiones WHERE id_detalle_venta = $1`, [det.id_detalle_venta]);
    const extrasResult = await query(`SELECT nom_ing, cantidad_extra FROM detalles_venta_extras WHERE id_detalle_venta = $1`, [det.id_detalle_venta]);
    const exclusiones = exclusionsResult.rows.map((e) => e.nom_ing);
    const extrasTexto = extrasResult.rows.map((e) => `+${e.cantidad_extra} ${e.nom_ing}`);
    if (exclusiones.length === 0 && extrasTexto.length === 0) return [];
    return [{ producto: null, cantidad: null, exclusiones, extras: extrasTexto }];
  }
  if (det.id_prom) {
    const promProductsResult = await query(
      `SELECT pp.id_prod, p.nom_prod
       FROM promocion_prod pp
       JOIN producto p ON p.id_prod = pp.id_prod
       WHERE pp.id_prom = $1`,
      [det.id_prom]
    );
    const grupos = [];
    for (const pp of promProductsResult.rows) {
      const breakdown = await buildPromoBreakdown(det.id_detalle_venta, pp.id_prod);
      for (const g of breakdown) {
        grupos.push({ producto: pp.nom_prod, cantidad: g.cantidad, exclusiones: g.exclusiones, extras: g.extras });
      }
    }
    return grupos;
  }
  return [];
};

/* Obtiene los detalles de una venta junto con sus productos, promociones, estados, meseros y personalizaciones. */
export const getDailySaleDetails = async (idVenta) => {
  const detallesResult = await query(
    `SELECT dv.id_detalle_venta, dv.id_prod, dv.id_prom, dv.cantidad_prod_det, dv.tipo_consumo, dv.subtotal,
            dv.estado_detalle_venta, dv.fecha_reg_detalle_venta, dv.id_mesero_actual,
            p.nom_prod, pr.nom_prom
     FROM detalles_venta dv
     LEFT JOIN producto p ON p.id_prod = dv.id_prod
     LEFT JOIN promocion pr ON pr.id_prom = dv.id_prom
     WHERE dv.id_venta = $1
     ORDER BY dv.fecha_reg_detalle_venta`,
    [idVenta]
  );

  const meseroIds = [...new Set(detallesResult.rows.map((d) => d.id_mesero_actual).filter(Boolean))];
  const empleadosResult = meseroIds.length
    ? await query(`SELECT cod_emp, alias_emp FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [meseroIds])
    : { rows: [] };
  const aliasById = new Map(empleadosResult.rows.map((e) => [e.cod_emp, e.alias_emp]));

  const grouped = new Map();
  for (const d of detallesResult.rows) {
    const producto = d.nom_prod || d.nom_prom;
    const personalizacionGrupos = await buildPersonalizacionDetalle(d);
    const mesero = aliasById.get(d.id_mesero_actual) || '—';
    const personalizacionKey = JSON.stringify(personalizacionGrupos);
    const key = `${producto}|${d.tipo_consumo}|${mesero}|${d.estado_detalle_venta}|${personalizacionKey}`;

    if (!grouped.has(key)) {
      grouped.set(key, {
        producto,
        cantidad: 0,
        tipoConsumo: d.tipo_consumo,
        subtotal: 0,
        estado: d.estado_detalle_venta,
        fecha: d.fecha_reg_detalle_venta instanceof Date ? d.fecha_reg_detalle_venta.toISOString() : d.fecha_reg_detalle_venta,
        mesero,
        esPromocion: Boolean(d.id_prom),
        personalizacionGrupos
      });
    }
    const entry = grouped.get(key);
    entry.cantidad += d.cantidad_prod_det;
    entry.subtotal += Number(d.subtotal);
  }

  return Array.from(grouped.values());
};

/* Obtiene los nombres de los cajeros que realizaron ventas durante el día, incluyendo DIRECTORIO cuando corresponda. */
export const listCajeroNames = async () => {
  const { start, end } = getTodayBoliviaRange();
  const ventasResult = await query(
    `SELECT cod_emp2 FROM venta WHERE fecha_reg >= $1 AND fecha_reg < $2`,
    [start, end]
  );
  const empleadoIds = [...new Set(ventasResult.rows.map((v) => v.cod_emp2).filter(Boolean))];
  const empleadosResult = empleadoIds.length
    ? await query(`SELECT cod_emp, alias_emp FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [empleadoIds])
    : { rows: [] };
  const nombres = new Set(empleadosResult.rows.map((e) => e.alias_emp));
  if (ventasResult.rows.some((v) => !v.cod_emp2)) nombres.add('DIRECTORIO');
  return Array.from(nombres).sort();
};
