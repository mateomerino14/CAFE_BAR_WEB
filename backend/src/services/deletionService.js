import { supabase } from '../config/supabaseClient.js';

const deleteVentasCascade = async (ventaIds) => {
  if (ventaIds.length === 0) return;

  const { data: detalles } = await supabase.from('detalles_venta').select('id_detalle_venta').in('id_venta', ventaIds);
  const detalleIds = (detalles || []).map((d) => d.id_detalle_venta);

  if (detalleIds.length > 0) {
    await supabase.from('detalles_venta_unidades').delete().in('id_detalle_venta', detalleIds);
    await supabase.from('detalles_venta_exclusiones').delete().in('id_detalle_venta', detalleIds);
    await supabase.from('detalles_venta_exclusiones_promo').delete().in('id_detalle_venta', detalleIds);
    await supabase.from('detalles_venta_extras').delete().in('id_detalle_venta', detalleIds);
  }

  const { data: mesasAfectadas } = await supabase
    .from('venta')
    .select('id_mesa, id_seccion')
    .in('id_venta', ventaIds)
    .not('id_mesa', 'is', null);

  await supabase.from('pago').delete().in('id_venta', ventaIds);
  await supabase.from('detalles_venta').delete().in('id_venta', ventaIds);
  await supabase.from('venta').delete().in('id_venta', ventaIds);

  for (const { id_mesa, id_seccion } of mesasAfectadas || []) {
    const { count } = await supabase
      .from('venta')
      .select('*', { count: 'exact', head: true })
      .eq('id_mesa', id_mesa)
      .eq('id_seccion', id_seccion);

    if ((count || 0) === 0) {
      await supabase.from('mesa').update({ disponible: true }).eq('id_mesa', id_mesa).eq('id_seccion', id_seccion);
    }
  }
};

const getVentaIdsByEmpleados = async (empleadoIds) => {
  if (empleadoIds.length === 0) return [];

  const { data: ventasDirectas } = await supabase
    .from('venta')
    .select('id_venta')
    .or(`cod_emp.in.(${empleadoIds.join(',')}),cod_emp2.in.(${empleadoIds.join(',')})`);

  const { data: detallesMesero } = await supabase
    .from('detalles_venta')
    .select('id_venta')
    .in('id_mesero_actual', empleadoIds);

  const ids = new Set([...(ventasDirectas || []).map((v) => v.id_venta), ...(detallesMesero || []).map((d) => d.id_venta)]);
  return Array.from(ids);
};

export const deleteEmpleados = async (empleadoIds) => {
  if (empleadoIds.length === 0) return;
  const ventaIds = await getVentaIdsByEmpleados(empleadoIds);
  await deleteVentasCascade(ventaIds);
  await supabase.from('empleado').delete().in('cod_emp', empleadoIds);
};

export const deleteCargos = async (cargoIds) => {
  if (cargoIds.length === 0) return;
  const { data: empleados } = await supabase.from('empleado').select('cod_emp').in('id_cargo', cargoIds);
  const empleadoIds = (empleados || []).map((e) => e.cod_emp);

  if (empleadoIds.length > 0) {
    const ventaIds = await getVentaIdsByEmpleados(empleadoIds);
    await deleteVentasCascade(ventaIds);
    await supabase.from('empleado').delete().in('cod_emp', empleadoIds);
  }

  await supabase.from('cargo').delete().in('id_cargo', cargoIds);
};

export const deleteSecciones = async (seccionIds) => {
  if (seccionIds.length === 0) return;
  const { data: mesasDeLaSeccion } = await supabase.from('mesa').select('id_mesa, id_seccion').in('id_seccion', seccionIds);
  const { data: ventasPorSeccion } = await supabase.from('venta').select('id_venta').in('id_seccion', seccionIds);
  let ventasPorMesa = [];
  if ((mesasDeLaSeccion || []).length > 0) {
    const condiciones = mesasDeLaSeccion.map((m) => `and(id_mesa.eq.${m.id_mesa},id_seccion.eq.${m.id_seccion})`).join(',');
    const { data } = await supabase.from('venta').select('id_venta').or(condiciones);
    ventasPorMesa = data || [];
  }
  const ventaIds = Array.from(new Set([
    ...(ventasPorSeccion || []).map((v) => v.id_venta),
    ...ventasPorMesa.map((v) => v.id_venta)
  ]));
  await deleteVentasCascade(ventaIds);
  await supabase.from('mesa').delete().in('id_seccion', seccionIds);
  await supabase.from('seccion').delete().in('id_seccion', seccionIds);
};

export const deleteVentasDirect = async (ventaIds) => {
  await deleteVentasCascade(ventaIds);
};

export const listEmployeesForDeletion = async (filtro) => {
  let query = supabase
    .from('empleado')
    .select('cod_emp, nom_emp, apell_pat_emp, apell_mat_emp, alias_emp, ci_emp, disponible_emp, cargo:cargo(nom_carg)')
    .order('nom_emp');

  if (filtro === 'activas') query = query.eq('disponible_emp', true);
  if (filtro === 'inactivas') query = query.eq('disponible_emp', false);

  const { data } = await query;
  return (data || []).map((e) => ({
    codEmp: e.cod_emp,
    nombreCompleto: `${e.nom_emp} ${e.apell_pat_emp} ${e.apell_mat_emp}`.trim(),
    alias: e.alias_emp,
    ci: e.ci_emp,
    cargo: e.cargo?.nom_carg || 'Sin cargo',
    disponible: e.disponible_emp
  }));
};

export const listCargosForDeletion = async () => {
  const { data: cargos } = await supabase.from('cargo').select('id_cargo, nom_carg').order('nom_carg');
  const { data: empleados } = await supabase.from('empleado').select('id_cargo');

  const countByCargo = new Map();
  for (const e of empleados || []) {
    countByCargo.set(e.id_cargo, (countByCargo.get(e.id_cargo) || 0) + 1);
  }

  return (cargos || []).map((c) => ({
    idCargo: c.id_cargo,
    nombre: c.nom_carg,
    numEmpleados: countByCargo.get(c.id_cargo) || 0
  }));
};

export const listSeccionesForDeletion = async () => {
  const { data: secciones } = await supabase.from('seccion').select('id_seccion, nomb_seccion').order('nomb_seccion');
  const { data: mesas } = await supabase.from('mesa').select('id_seccion').eq('existe', true);
  const { data: ventas } = await supabase.from('venta').select('id_seccion');

  const mesasBySeccion = new Map();
  for (const m of mesas || []) mesasBySeccion.set(m.id_seccion, (mesasBySeccion.get(m.id_seccion) || 0) + 1);

  const ventasBySeccion = new Map();
  for (const v of ventas || []) ventasBySeccion.set(v.id_seccion, (ventasBySeccion.get(v.id_seccion) || 0) + 1);

  return (secciones || []).map((s) => ({
    idSeccion: s.id_seccion,
    nombre: s.nomb_seccion,
    numMesas: mesasBySeccion.get(s.id_seccion) || 0,
    numVentas: ventasBySeccion.get(s.id_seccion) || 0
  }));
};

export const listVentasForDeletion = async () => {
  const { data: ventas } = await supabase
    .from('venta')
    .select('id_venta, num_venta, fecha_reg, hora_reg, total_venta, id_mesa, seccion:seccion(nomb_seccion)')
    .order('fecha_reg', { ascending: false })
    .limit(500);

  if (!ventas || ventas.length === 0) return [];

  const ventaIds = ventas.map((v) => v.id_venta);
  const { data: detalles } = await supabase.from('detalles_venta').select('id_venta, estado_detalle_venta').in('id_venta', ventaIds);

  const estadoByVenta = new Map();
  for (const d of detalles || []) {
    if (d.estado_detalle_venta === 'PENDIENTE') estadoByVenta.set(d.id_venta, 'En Preparación');
    else if (!estadoByVenta.has(d.id_venta)) estadoByVenta.set(d.id_venta, 'Finalizada');
  }

  return ventas.map((v) => ({
    idVenta: v.id_venta,
    numVenta: v.num_venta,
    fecha: v.fecha_reg,
    hora: v.hora_reg,
    total: v.total_venta,
    mesa: v.id_mesa,
    seccion: v.seccion?.nomb_seccion || 'N/A',
    estado: estadoByVenta.get(v.id_venta) || 'Finalizada'
  }));
};

export const buildDependencyTree = async (seleccionados) => {
  const { empleados = [], cargos = [], secciones = [] } = seleccionados;

  const dependientes = { empleados: [], ventas: [], mesas: [] };

  if (cargos.length > 0) {
    const { data } = await supabase.from('empleado').select('cod_emp, alias_emp').in('id_cargo', cargos);
    dependientes.empleados = (data || []).map((e) => ({ id: e.cod_emp, nombre: e.alias_emp }));
  }

  if (secciones.length > 0) {
    const { data: mesas } = await supabase.from('mesa').select('id_mesa').in('id_seccion', secciones).eq('existe', true);
    dependientes.mesas = (mesas || []).map((m) => ({ id: m.id_mesa, nombre: `Mesa ${m.id_mesa}` }));

    const { data: ventasSec } = await supabase.from('venta').select('id_venta, num_venta').in('id_seccion', secciones);
    dependientes.ventas.push(...(ventasSec || []).map((v) => ({ id: v.id_venta, nombre: `Venta N° ${v.num_venta}` })));
  }

  const allEmpleadoIds = [...empleados, ...dependientes.empleados.map((e) => e.id)];
  if (allEmpleadoIds.length > 0) {
    const ventaIds = await getVentaIdsByEmpleados(allEmpleadoIds);
    if (ventaIds.length > 0) {
      const { data: ventasEmp } = await supabase.from('venta').select('id_venta, num_venta').in('id_venta', ventaIds);
      dependientes.ventas.push(...(ventasEmp || []).map((v) => ({ id: v.id_venta, nombre: `Venta N° ${v.num_venta}` })));
    }
  }

  return dependientes;
};