import {supabase} from '../config/supabaseClient.js';
import {hashPassword, verifyPassword} from '../utils/password.js';

/* Obtiene el enlace configurado del sistema tributario o devuelve el enlace predeterminado si no existe. */
export const getTaxLink = async () => {
  const {data} = await supabase.from('enlace').select('enlace').limit(1).maybeSingle();
  return data?.enlace || 'https://siat.impuestos.gob.bo/v2/launcher/';
};

/* Actualiza el enlace del sistema tributario existente o crea uno nuevo si todavía no está registrado. */
export const updateTaxLink = async (enlace) => {
  const {data: existing} = await supabase.from('enlace').select('id_enlace').limit(1).maybeSingle();
  if (existing) {
    await supabase.from('enlace').update({enlace}).eq('id_enlace', existing.id_enlace);
  } 
  else {
    await supabase.from('enlace').insert({enlace});
  }
};

/* Verifica la contraseña actual del usuario DIRECTORIO y actualiza su contraseña por una nueva. */
export const changeDirectorioPassword = async (actual, nueva) => {
  const {data} = await supabase.from('directorio').select('id_admin, contrasena_admin').limit(1).maybeSingle();
  if (!data) throw new Error('DIRECTORIO_NOT_FOUND');
  const valid = await verifyPassword(actual, data.contrasena_admin);
  if (!valid) throw new Error('WRONG_PASSWORD');
  const hashed = await hashPassword(nueva);
  await supabase.from('directorio').update({contrasena_admin: hashed}).eq('id_admin', data.id_admin);
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
  return {start: start.toISOString(), end: end.toISOString()};
};


/* Obtiene el estado general de cada venta a partir del estado de sus detalles. */
const getVentaEstados = async (ventaIds) => {
  if (ventaIds.length === 0) return new Map();
  const {data: detalles} = await supabase
    .from('detalles_venta')
    .select('id_venta, estado_detalle_venta')
    .in('id_venta', ventaIds);
  const estadoByVenta = new Map();
  for (const d of detalles || []) {
    if (d.estado_detalle_venta === 'PENDIENTE') {
      estadoByVenta.set(d.id_venta, 'En Preparación');
    } 
    else if (!estadoByVenta.has(d.id_venta)) {
      estadoByVenta.set(d.id_venta, 'Finalizada');
    }
  }
  return estadoByVenta;
};

/* Obtiene un resumen de las ventas del día, clasificándolas entre finalizadas y en preparación. */
export const getDailySalesSummary = async () => {
  const {start, end} = getTodayBoliviaRange();
  const {data: ventas} = await supabase
    .from('venta')
    .select('id_venta, total_venta')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end);
  const ventaIds = (ventas || []).map((v) => v.id_venta);
  const estadoByVenta = await getVentaEstados(ventaIds);
  let finalizadas = 0;
  let montoFinalizado = 0;
  let enPreparacion = 0;
  for (const venta of ventas || []) {
    const estado = estadoByVenta.get(venta.id_venta) || 'Finalizada';
    if (estado === 'Finalizada') {
      finalizadas += 1;
      montoFinalizado += Number(venta.total_venta);
    } 
    else {
      enPreparacion += 1;
    }
  }
  return {finalizadas, montoFinalizado, enPreparacion, total: (ventas || []).length};
};

/* Lista las ventas del día con información de empleados, estado, mesa y total, permitiendo filtrar y buscar por cajero. */
export const listDailySales = async (filtro, busqueda) => {
  const {start, end} = getTodayBoliviaRange();
  const {data: ventas} = await supabase
    .from('venta')
    .select('id_venta, num_venta, hora_reg, id_mesa, total_venta, cod_emp, cod_emp2')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end)
    .order('hora_reg', {ascending: false});
  if (!ventas || ventas.length === 0) {
    return [];
  }
  const ventaIds = ventas.map((v) => v.id_venta);
  const estadoByVenta = await getVentaEstados(ventaIds);
  const empleadoIds = [...new Set(ventas.flatMap((v) => [v.cod_emp, v.cod_emp2]).filter(Boolean))];
  const {data: empleados} = empleadoIds.length
    ? await supabase.from('empleado').select('cod_emp, alias_emp').in('cod_emp', empleadoIds)
    : { data: [] };
  const aliasById = new Map((empleados || []).map((e) => [e.cod_emp, e.alias_emp]));
  let result = ventas.map((v) => ({
    idVenta: v.id_venta,
    numVenta: v.num_venta,
    hora: v.hora_reg,
    meseroApertura: aliasById.get(v.cod_emp) || '—',
    cajero: v.cod_emp2 ? (aliasById.get(v.cod_emp2) || '—') : 'DIRECTORIO',
    total: v.total_venta,
    mesa: v.id_mesa,
    estado: estadoByVenta.get(v.id_venta) || 'Finalizada'
  }));
  if (filtro === 'Finalizadas') {
    result = result.filter((r) => r.estado === 'Finalizada');
  }
  if (filtro === 'En preparación') {
    result = result.filter((r) => r.estado === 'En Preparación');
  }
  if (busqueda) {
    const term = busqueda.toLowerCase();
    result = result.filter((r) => r.cajero.toLowerCase().includes(term));
  }
  return result;
};


/* Agrupa las personalizaciones de los productos de una promoción según sus exclusiones y extras. */
const buildPromoBreakdown = async (idDetalleVenta, idProd) => {
  const {data: exclusionRows} = await supabase
    .from('detalles_venta_exclusiones_promo')
    .select('nom_ing, num_unidad')
    .eq('id_detalle_venta', idDetalleVenta)
    .eq('id_prod', idProd);
  const {data: extraRows} = await supabase
    .from('detalles_venta_extras')
    .select('nom_ing, cantidad_extra, num_unidad')
    .eq('id_detalle_venta', idDetalleVenta)
    .eq('id_prod', idProd);
  const exclusionsByUnit = new Map();
  for (const row of exclusionRows || []) {
    if (!exclusionsByUnit.has(row.num_unidad)) exclusionsByUnit.set(row.num_unidad, []);
    exclusionsByUnit.get(row.num_unidad).push(row.nom_ing);
  }
  const extrasByUnit = new Map();
  for (const row of extraRows || []) {
    if (row.num_unidad === null || row.num_unidad === undefined) {
      continue;
    }
    if (!extrasByUnit.has(row.num_unidad)) {
      extrasByUnit.set(row.num_unidad, []);
    }
    extrasByUnit.get(row.num_unidad).push(`+${row.cantidad_extra} ${row.nom_ing}`);
  }
  const customizedUnits = new Set([...exclusionsByUnit.keys(), ...extrasByUnit.keys()]);
  const groups = new Map();
  for (const unit of customizedUnits) {
    const exclusiones = (exclusionsByUnit.get(unit) || []).slice().sort();
    const extras = (extrasByUnit.get(unit) || []).slice().sort();
    const key = `${exclusiones.join(',')}|${extras.join(',')}`;
    if (!groups.has(key)) {
      groups.set(key,{cantidad: 0, exclusiones, extras});
    }
    groups.get(key).cantidad += 1;
  }
  return Array.from(groups.values()).filter((g) => g.exclusiones.length || g.extras.length);
};


/* Obtiene las personalizaciones, exclusiones y extras asociados a un detalle de venta o a los productos de una promoción. */
const buildPersonalizacionDetalle = async (det) => {
  if (det.id_prod) {
    const {data: exclusions} = await supabase.from('detalles_venta_exclusiones').select('nom_ing').eq('id_detalle_venta', det.id_detalle_venta);
    const {data: extras} = await supabase.from('detalles_venta_extras').select('nom_ing, cantidad_extra').eq('id_detalle_venta', det.id_detalle_venta);
    const exclusiones = (exclusions || []).map((e) => e.nom_ing);
    const extrasTexto = (extras || []).map((e) => `+${e.cantidad_extra} ${e.nom_ing}`);
    if (exclusiones.length === 0 && extrasTexto.length === 0) {
      return [];
    }
    return [{producto: null, cantidad: null, exclusiones, extras: extrasTexto}];
  }
  if (det.id_prom) {
    const {data: promProducts} = await supabase
      .from('promocion_prod')
      .select('id_prod, producto:producto(nom_prod)')
      .eq('id_prom', det.id_prom);
    const grupos = [];
    for (const pp of promProducts || []) {
      const breakdown = await buildPromoBreakdown(det.id_detalle_venta, pp.id_prod);
      for (const g of breakdown) {
        grupos.push({producto: pp.producto?.nom_prod, cantidad: g.cantidad, exclusiones: g.exclusiones, extras: g.extras});
      }
    }
    return grupos;
  }
  return [];
};


/* Obtiene los detalles de una venta junto con sus productos, promociones, estados, meseros y personalizaciones. */
export const getDailySaleDetails = async (idVenta) => {
  const {data: detalles} = await supabase
    .from('detalles_venta')
    .select('id_detalle_venta, id_prod, id_prom, cantidad_prod_det, tipo_consumo, subtotal, estado_detalle_venta, fecha_reg_detalle_venta, id_mesero_actual, producto:producto(nom_prod), promocion:promocion(nom_prom)')
    .eq('id_venta', idVenta)
    .order('fecha_reg_detalle_venta');
  const meseroIds = [...new Set((detalles || []).map((d) => d.id_mesero_actual).filter(Boolean))];
  const {data: empleados} = meseroIds.length
    ? await supabase.from('empleado').select('cod_emp, alias_emp').in('cod_emp', meseroIds)
    : {data: []};
  const aliasById = new Map((empleados || []).map((e) => [e.cod_emp, e.alias_emp]));
  const result = [];
  for (const d of detalles || []) {
    const personalizacionGrupos = await buildPersonalizacionDetalle(d);
    result.push({
      producto: d.producto?.nom_prod || d.promocion?.nom_prom,
      cantidad: d.cantidad_prod_det,
      tipoConsumo: d.tipo_consumo,
      subtotal: d.subtotal,
      estado: d.estado_detalle_venta,
      fecha: d.fecha_reg_detalle_venta,
      mesero: aliasById.get(d.id_mesero_actual) || '—',
      esPromocion: Boolean(d.id_prom),
      personalizacionGrupos
    });
  }
  return result;
};


/* Obtiene los nombres de los cajeros que realizaron ventas durante el día, incluyendo DIRECTORIO cuando corresponda. */
export const listCajeroNames = async () => {
  const {start, end} = getTodayBoliviaRange();
  const {data: ventas} = await supabase
    .from('venta')
    .select('cod_emp2')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end);
  const empleadoIds = [...new Set((ventas || []).map((v) => v.cod_emp2).filter(Boolean))];
  const {data: empleados} = empleadoIds.length
    ? await supabase.from('empleado').select('cod_emp, alias_emp').in('cod_emp', empleadoIds)
    : {data: []};
  const nombres = new Set((empleados || []).map((e) => e.alias_emp));
  if ((ventas || []).some((v) => !v.cod_emp2)) nombres.add('DIRECTORIO');
  return Array.from(nombres).sort();
};


/* Obtiene la dirección configurada del agente de impresión o devuelve una cadena vacía si no existe. */
export const getPrintAgentUrl = async () => {
  const {data} = await supabase.from('print_agent_config').select('url').limit(1).maybeSingle();
  return data?.url || '';
};


/* Actualiza la dirección del agente de impresión existente o crea una nueva configuración si no está registrada. */
export const updatePrintAgentUrl = async (url) => {
  const {data: existing} = await supabase.from('print_agent_config').select('id').limit(1).maybeSingle();
  if (existing) {
    await supabase.from('print_agent_config').update({url}).eq('id', existing.id);
  } 
  else {
    await supabase.from('print_agent_config').insert({url});
  }
};