import { query } from '../config/db.js';

/* Elimina ventas y todos sus registros dependientes relacionados, incluyendo detalles, pagos, extras, exclusiones y unidades, y libera las mesas que ya no tienen ventas asociadas. */
const deleteVentasCascade = async (ventaIds) => {
  if (ventaIds.length === 0) return;

  const detallesResult = await query(
    `SELECT id_detalle_venta FROM detalles_venta WHERE id_venta = ANY($1::bigint[])`,
    [ventaIds]
  );
  const detalleIds = detallesResult.rows.map((d) => d.id_detalle_venta);

  if (detalleIds.length > 0) {
    await query(`DELETE FROM detalles_venta_unidades WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds]);
    await query(`DELETE FROM detalles_venta_exclusiones WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds]);
    await query(`DELETE FROM detalles_venta_exclusiones_promo WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds]);
    await query(`DELETE FROM detalles_venta_extras WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds]);
  }

  const mesasResult = await query(
    `SELECT id_mesa, id_seccion FROM venta WHERE id_venta = ANY($1::bigint[]) AND id_mesa IS NOT NULL`,
    [ventaIds]
  );

  await query(`DELETE FROM pago WHERE id_venta = ANY($1::bigint[])`, [ventaIds]);
  await query(`DELETE FROM detalles_venta WHERE id_venta = ANY($1::bigint[])`, [ventaIds]);
  await query(`DELETE FROM venta WHERE id_venta = ANY($1::bigint[])`, [ventaIds]);

  for (const { id_mesa, id_seccion } of mesasResult.rows) {
    const countResult = await query(
      `SELECT COUNT(*) FROM venta WHERE id_mesa = $1 AND id_seccion = $2`,
      [id_mesa, id_seccion]
    );
    if (Number(countResult.rows[0].count) === 0) {
      await query(`UPDATE mesa SET disponible = true WHERE id_mesa = $1 AND id_seccion = $2`, [id_mesa, id_seccion]);
    }
  }
};

/* Obtiene los identificadores de las ventas asociadas directa o indirectamente a uno o varios empleados mediante el responsable de la venta, cobrador o mesero actual. */
const getVentaIdsByEmpleados = async (empleadoIds) => {
  if (empleadoIds.length === 0) return [];
  const ventasDirectasResult = await query(
    `SELECT id_venta FROM venta WHERE cod_emp = ANY($1::bigint[]) OR cod_emp2 = ANY($1::bigint[])`,
    [empleadoIds]
  );
  const detallesMeseroResult = await query(
    `SELECT id_venta FROM detalles_venta WHERE id_mesero_actual = ANY($1::bigint[])`,
    [empleadoIds]
  );
  const ids = new Set([
    ...ventasDirectasResult.rows.map((v) => v.id_venta),
    ...detallesMeseroResult.rows.map((d) => d.id_venta)
  ]);
  return Array.from(ids);
};

/* Elimina uno o varios empleados junto con las ventas y registros dependientes relacionados con ellos. */
export const deleteEmpleados = async (empleadoIds) => {
  if (empleadoIds.length === 0) return;
  const ventaIds = await getVentaIdsByEmpleados(empleadoIds);
  await deleteVentasCascade(ventaIds);
  await query(`DELETE FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [empleadoIds]);
};

/* Obtiene los empleados asociados a los cargos indicados, elimina sus ventas y dependencias, y finalmente elimina los cargos seleccionados. */
export const deleteCargos = async (cargoIds) => {
  if (cargoIds.length === 0) return;
  const empleadosResult = await query(`SELECT cod_emp FROM empleado WHERE id_cargo = ANY($1::bigint[])`, [cargoIds]);
  const empleadoIds = empleadosResult.rows.map((e) => e.cod_emp);
  if (empleadoIds.length > 0) {
    const ventaIds = await getVentaIdsByEmpleados(empleadoIds);
    await deleteVentasCascade(ventaIds);
    await query(`DELETE FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [empleadoIds]);
  }
  await query(`DELETE FROM cargo WHERE id_cargo = ANY($1::bigint[])`, [cargoIds]);
};

/* Obtiene las mesas y ventas pertenecientes a las secciones seleccionadas, elimina sus dependencias y posteriormente elimina las mesas y secciones. */
export const deleteSecciones = async (seccionIds) => {
  if (seccionIds.length === 0) return;

  const mesasResult = await query(`SELECT id_mesa, id_seccion FROM mesa WHERE id_seccion = ANY($1::bigint[])`, [seccionIds]);
  const ventasPorSeccionResult = await query(`SELECT id_venta FROM venta WHERE id_seccion = ANY($1::bigint[])`, [seccionIds]);

  let ventasPorMesa = [];
  if (mesasResult.rows.length > 0) {
    const idMesaArray = mesasResult.rows.map((m) => m.id_mesa);
    const idSeccionArray = mesasResult.rows.map((m) => m.id_seccion);
    const result = await query(
      `SELECT DISTINCT v.id_venta
       FROM venta v
       JOIN unnest($1::int[], $2::bigint[]) AS pares(id_mesa, id_seccion)
         ON v.id_mesa = pares.id_mesa AND v.id_seccion = pares.id_seccion`,
      [idMesaArray, idSeccionArray]
    );
    ventasPorMesa = result.rows;
  }

  const ventaIds = Array.from(new Set([
    ...ventasPorSeccionResult.rows.map((v) => v.id_venta),
    ...ventasPorMesa.map((v) => v.id_venta)
  ]));

  await deleteVentasCascade(ventaIds);
  await query(`DELETE FROM mesa WHERE id_seccion = ANY($1::bigint[])`, [seccionIds]);
  await query(`DELETE FROM seccion WHERE id_seccion = ANY($1::bigint[])`, [seccionIds]);
};

/* Elimina directamente las ventas indicadas junto con todos sus registros dependientes y libera las mesas que correspondan. */
export const deleteVentasDirect = async (ventaIds) => {
  await deleteVentasCascade(ventaIds);
};

/* Obtiene la lista de empleados disponible para eliminación, permitiendo filtrar por empleados activos o inactivos y mostrando sus datos y cargo. */
export const listEmployeesForDeletion = async (filtro) => {
  const baseQuery = `
    SELECT e.cod_emp, e.nom_emp, e.apell_pat_emp, e.apell_mat_emp, e.alias_emp, e.ci_emp, e.disponible_emp, c.nom_carg
    FROM empleado e
    JOIN cargo c ON c.id_cargo = e.id_cargo
  `;
  let result;
  if (filtro === 'activas') {
    result = await query(`${baseQuery} WHERE e.disponible_emp = true ORDER BY e.nom_emp`);
  } else if (filtro === 'inactivas') {
    result = await query(`${baseQuery} WHERE e.disponible_emp = false ORDER BY e.nom_emp`);
  } else {
    result = await query(`${baseQuery} ORDER BY e.nom_emp`);
  }

  return result.rows.map((e) => ({
    codEmp: e.cod_emp,
    nombreCompleto: `${e.nom_emp} ${e.apell_pat_emp} ${e.apell_mat_emp}`.trim(),
    alias: e.alias_emp,
    ci: e.ci_emp,
    cargo: e.nom_carg || 'Sin cargo',
    disponible: e.disponible_emp
  }));
};

/* Obtiene todos los cargos y calcula la cantidad de empleados asociados a cada uno para mostrar sus dependencias antes de eliminarlos. */
export const listCargosForDeletion = async () => {
  const cargosResult = await query(`SELECT id_cargo, nom_carg FROM cargo ORDER BY nom_carg`);
  const empleadosResult = await query(`SELECT id_cargo FROM empleado`);
  const countByCargo = new Map();
  for (const e of empleadosResult.rows) {
    countByCargo.set(e.id_cargo, (countByCargo.get(e.id_cargo) || 0) + 1);
  }
  return cargosResult.rows.map((c) => ({
    idCargo: c.id_cargo,
    nombre: c.nom_carg,
    numEmpleados: countByCargo.get(c.id_cargo) || 0
  }));
};

/* Obtiene las secciones existentes y calcula la cantidad de mesas y ventas asociadas a cada sección para mostrar sus dependencias antes de eliminarlas. */
export const listSeccionesForDeletion = async () => {
  const seccionesResult = await query(`SELECT id_seccion, nomb_seccion FROM seccion ORDER BY nomb_seccion`);
  const mesasResult = await query(`SELECT id_seccion FROM mesa WHERE existe = true`);
  const ventasResult = await query(`SELECT id_seccion FROM venta`);

  const mesasBySeccion = new Map();
  for (const m of mesasResult.rows) mesasBySeccion.set(m.id_seccion, (mesasBySeccion.get(m.id_seccion) || 0) + 1);
  const ventasBySeccion = new Map();
  for (const v of ventasResult.rows) ventasBySeccion.set(v.id_seccion, (ventasBySeccion.get(v.id_seccion) || 0) + 1);

  return seccionesResult.rows.map((s) => ({
    idSeccion: s.id_seccion,
    nombre: s.nomb_seccion,
    numMesas: mesasBySeccion.get(s.id_seccion) || 0,
    numVentas: ventasBySeccion.get(s.id_seccion) || 0
  }));
};

/* Obtiene las ventas registradas con sus datos principales y determina su estado según los detalles de venta pendientes o finalizados. */
export const listVentasForDeletion = async () => {
  const ventasResult = await query(
    `SELECT v.id_venta, v.num_venta, v.fecha_reg, v.hora_reg, v.total_venta, v.id_mesa, s.nomb_seccion
     FROM venta v
     LEFT JOIN seccion s ON s.id_seccion = v.id_seccion
     ORDER BY v.fecha_reg DESC
     LIMIT 500`
  );
  if (ventasResult.rows.length === 0) return [];

  const ventaIds = ventasResult.rows.map((v) => v.id_venta);
  const detallesResult = await query(
    `SELECT id_venta, estado_detalle_venta FROM detalles_venta WHERE id_venta = ANY($1::bigint[])`,
    [ventaIds]
  );
  const estadoByVenta = new Map();
  for (const d of detallesResult.rows) {
    if (d.estado_detalle_venta === 'PENDIENTE') estadoByVenta.set(d.id_venta, 'En Preparación');
    else if (!estadoByVenta.has(d.id_venta)) estadoByVenta.set(d.id_venta, 'Finalizada');
  }

  return ventasResult.rows.map((v) => ({
    idVenta: v.id_venta,
    numVenta: v.num_venta,
    fecha: v.fecha_reg,
    hora: v.hora_reg,
    total: v.total_venta,
    mesa: v.id_mesa,
    seccion: v.nomb_seccion || 'N/A',
    estado: estadoByVenta.get(v.id_venta) || 'Finalizada'
  }));
};

/* Construye un árbol de dependencias de los elementos seleccionados, identificando empleados, ventas y mesas que serían afectados por la eliminación. */
export const buildDependencyTree = async (seleccionados) => {
  const { empleados = [], cargos = [], secciones = [] } = seleccionados;
  const dependientes = { empleados: [], ventas: [], mesas: [] };

  if (cargos.length > 0) {
    const result = await query(`SELECT cod_emp, alias_emp FROM empleado WHERE id_cargo = ANY($1::bigint[])`, [cargos]);
    dependientes.empleados = result.rows.map((e) => ({ id: e.cod_emp, nombre: e.alias_emp }));
  }

  if (secciones.length > 0) {
    const mesasResult = await query(`SELECT id_mesa FROM mesa WHERE id_seccion = ANY($1::bigint[]) AND existe = true`, [secciones]);
    dependientes.mesas = mesasResult.rows.map((m) => ({ id: m.id_mesa, nombre: `Mesa ${m.id_mesa}` }));

    const ventasSecResult = await query(`SELECT id_venta, num_venta FROM venta WHERE id_seccion = ANY($1::bigint[])`, [secciones]);
    dependientes.ventas.push(...ventasSecResult.rows.map((v) => ({ id: v.id_venta, nombre: `Venta N° ${v.num_venta}` })));
  }

  const allEmpleadoIds = [...empleados, ...dependientes.empleados.map((e) => e.id)];
  if (allEmpleadoIds.length > 0) {
    const ventaIds = await getVentaIdsByEmpleados(allEmpleadoIds);
    if (ventaIds.length > 0) {
      const ventasEmpResult = await query(`SELECT id_venta, num_venta FROM venta WHERE id_venta = ANY($1::bigint[])`, [ventaIds]);
      dependientes.ventas.push(...ventasEmpResult.rows.map((v) => ({ id: v.id_venta, nombre: `Venta N° ${v.num_venta}` })));
    }
  }

  return dependientes;
};
