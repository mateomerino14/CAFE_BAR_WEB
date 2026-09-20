import { query } from '../config/db.js';

/*Convierte un rango de fechas en fechas ISO, ajustando la fecha final para incluir todo el día indicado.*/
const getDateRangeISO = (fechaInicio, fechaFin) => {
  const start = new Date(`${fechaInicio}T04:00:00.000Z`);
  const endBase = new Date(`${fechaFin}T04:00:00.000Z`);
  const end = new Date(endBase.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
};

/*Convierte de forma segura un valor de fecha/hora (Date de pg o string) a un string ISO consistente.*/
const toIsoString = (value) => {
  if (!value) return value;
  return value instanceof Date ? value.toISOString() : value;
};

/*Obtiene y determina el estado de las ventas a partir del estado de sus detalles asociados.*/
const getEstadoByVenta = async (ventaIds) => {
  if (ventaIds.length === 0) return new Map();
  const result = await query(
    `SELECT id_venta, estado_detalle_venta FROM detalles_venta WHERE id_venta = ANY($1::bigint[])`,
    [ventaIds]
  );
  const estadoByVenta = new Map();
  for (const d of result.rows) {
    if (d.estado_detalle_venta === 'PENDIENTE') estadoByVenta.set(d.id_venta, 'En Preparación');
    else if (!estadoByVenta.has(d.id_venta)) estadoByVenta.set(d.id_venta, 'Finalizada');
  }
  return estadoByVenta;
};

/*Obtiene los empleados disponibles para los reportes y agrega la opción especial DIRECTORIO.*/
export const listEmployeesForReports = async () => {
  const result = await query(`SELECT cod_emp, alias_emp FROM empleado ORDER BY alias_emp`);
  return [{ codEmp: -1, alias: 'DIRECTORIO' }, ...result.rows.map((e) => ({ codEmp: e.cod_emp, alias: e.alias_emp }))];
};

/*Genera un reporte detallado de ventas dentro de un rango de fechas, incluyendo empleados, pagos, productos, promociones y personalizaciones.*/
export const getDetailedSalesReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);

  let ventasResult;
  if (empleadoId !== undefined && empleadoId !== null && empleadoId !== '') {
    const idNum = Number(empleadoId);
    if (idNum === -1) {
      ventasResult = await query(
        `SELECT v.id_venta, v.num_venta, v.fecha_reg, v.hora_reg, v.total_venta, v.id_mesa, v.cod_emp, v.cod_emp2, s.nomb_seccion
         FROM venta v LEFT JOIN seccion s ON s.id_seccion = v.id_seccion
         WHERE v.fecha_reg >= $1 AND v.fecha_reg < $2 AND v.cod_emp2 IS NULL
         ORDER BY v.fecha_reg, v.hora_reg`,
        [start, end]
      );
    } else {
      ventasResult = await query(
        `SELECT v.id_venta, v.num_venta, v.fecha_reg, v.hora_reg, v.total_venta, v.id_mesa, v.cod_emp, v.cod_emp2, s.nomb_seccion
         FROM venta v LEFT JOIN seccion s ON s.id_seccion = v.id_seccion
         WHERE v.fecha_reg >= $1 AND v.fecha_reg < $2 AND v.cod_emp2 = $3
         ORDER BY v.fecha_reg, v.hora_reg`,
        [start, end, idNum]
      );
    }
  } else {
    ventasResult = await query(
      `SELECT v.id_venta, v.num_venta, v.fecha_reg, v.hora_reg, v.total_venta, v.id_mesa, v.cod_emp, v.cod_emp2, s.nomb_seccion
       FROM venta v LEFT JOIN seccion s ON s.id_seccion = v.id_seccion
       WHERE v.fecha_reg >= $1 AND v.fecha_reg < $2
       ORDER BY v.fecha_reg, v.hora_reg`,
      [start, end]
    );
  }

  const ventas = ventasResult.rows;
  if (ventas.length === 0) return [];

  const ventaIds = ventas.map((v) => v.id_venta);
  const estadoByVenta = await getEstadoByVenta(ventaIds);

  const pagosResult = await query(`SELECT id_venta, id_metodo, monto FROM pago WHERE id_venta = ANY($1::bigint[])`, [ventaIds]);
  const metodosResult = await query(`SELECT id_metodo, nombre FROM metodo_pago`);
  const efectivoId = metodosResult.rows.find((m) => m.nombre.toLowerCase() === 'efectivo')?.id_metodo;
  const qrId = metodosResult.rows.find((m) => m.nombre.toLowerCase() === 'qr')?.id_metodo;

  const pagosByVenta = new Map();
  for (const p of pagosResult.rows) {
    if (!pagosByVenta.has(p.id_venta)) pagosByVenta.set(p.id_venta, { efectivo: 0, qr: 0, total: 0 });
    const entry = pagosByVenta.get(p.id_venta);
    entry.total += Number(p.monto);
    if (p.id_metodo === efectivoId) entry.efectivo += Number(p.monto);
    if (p.id_metodo === qrId) entry.qr += Number(p.monto);
  }

  const allDetallesResult = await query(
    `SELECT dv.id_detalle_venta, dv.id_venta, dv.id_prod, dv.id_prom, dv.cantidad_prod_det, dv.tipo_consumo, dv.subtotal, dv.id_mesero_actual,
            p.nom_prod, pr.nom_prom
     FROM detalles_venta dv
     LEFT JOIN producto p ON p.id_prod = dv.id_prod
     LEFT JOIN promocion pr ON pr.id_prom = dv.id_prom
     WHERE dv.id_venta = ANY($1::bigint[])`,
    [ventaIds]
  );
  const allDetalles = allDetallesResult.rows;

  const empleadoIds = [...new Set([
    ...ventas.flatMap((v) => [v.cod_emp, v.cod_emp2]),
    ...allDetalles.map((d) => d.id_mesero_actual)
  ].filter(Boolean))];
  const empleadosResult = empleadoIds.length
    ? await query(`SELECT cod_emp, alias_emp FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [empleadoIds])
    : { rows: [] };
  const aliasById = new Map(empleadosResult.rows.map((e) => [e.cod_emp, e.alias_emp]));

  const detalleIds = allDetalles.map((d) => d.id_detalle_venta);
  const productDetalleIds = allDetalles.filter((d) => d.id_prod).map((d) => d.id_detalle_venta);
  const promoDetalleIds = allDetalles.filter((d) => d.id_prom).map((d) => d.id_detalle_venta);
  const promoIds = [...new Set(allDetalles.filter((d) => d.id_prom).map((d) => d.id_prom))];

  const [exclusionsResult, extrasResult, exclusionsPromoResult, promoProductsRowsResult] = await Promise.all([
    productDetalleIds.length
      ? query(`SELECT id_detalle_venta, nom_ing FROM detalles_venta_exclusiones WHERE id_detalle_venta = ANY($1::bigint[])`, [productDetalleIds])
      : Promise.resolve({ rows: [] }),
    detalleIds.length
      ? query(`SELECT id_detalle_venta, id_prod, nom_ing, cantidad_extra, num_unidad FROM detalles_venta_extras WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds])
      : Promise.resolve({ rows: [] }),
    promoDetalleIds.length
      ? query(`SELECT id_detalle_venta, id_prod, nom_ing, num_unidad FROM detalles_venta_exclusiones_promo WHERE id_detalle_venta = ANY($1::bigint[])`, [promoDetalleIds])
      : Promise.resolve({ rows: [] }),
    promoIds.length
      ? query(`SELECT pp.id_prom, pp.id_prod, p.nom_prod FROM promocion_prod pp JOIN producto p ON p.id_prod = pp.id_prod WHERE pp.id_prom = ANY($1::bigint[])`, [promoIds])
      : Promise.resolve({ rows: [] })
  ]);

  const exclusionsByDetalle = new Map();
  for (const e of exclusionsResult.rows) {
    if (!exclusionsByDetalle.has(e.id_detalle_venta)) exclusionsByDetalle.set(e.id_detalle_venta, []);
    exclusionsByDetalle.get(e.id_detalle_venta).push(e.nom_ing);
  }

  const extrasByDetalleNoProd = new Map();
  const extrasPromoByDetProd = new Map();
  for (const e of extrasResult.rows) {
    if (!e.id_prod) {
      if (!extrasByDetalleNoProd.has(e.id_detalle_venta)) extrasByDetalleNoProd.set(e.id_detalle_venta, []);
      extrasByDetalleNoProd.get(e.id_detalle_venta).push(`+${e.cantidad_extra} ${e.nom_ing}`);
    } else if (e.num_unidad !== null && e.num_unidad !== undefined) {
      const dpKey = `${e.id_detalle_venta}|${e.id_prod}`;
      if (!extrasPromoByDetProd.has(dpKey)) extrasPromoByDetProd.set(dpKey, new Map());
      const unitMap = extrasPromoByDetProd.get(dpKey);
      if (!unitMap.has(e.num_unidad)) unitMap.set(e.num_unidad, []);
      unitMap.get(e.num_unidad).push(`+${e.cantidad_extra} ${e.nom_ing}`);
    }
  }

  const exclusionsPromoByDetProd = new Map();
  for (const e of exclusionsPromoResult.rows) {
    const dpKey = `${e.id_detalle_venta}|${e.id_prod}`;
    if (!exclusionsPromoByDetProd.has(dpKey)) exclusionsPromoByDetProd.set(dpKey, new Map());
    const unitMap = exclusionsPromoByDetProd.get(dpKey);
    if (!unitMap.has(e.num_unidad)) unitMap.set(e.num_unidad, []);
    unitMap.get(e.num_unidad).push(e.nom_ing);
  }

  const promoProductsByPromo = new Map();
  for (const pp of promoProductsRowsResult.rows) {
    if (!promoProductsByPromo.has(pp.id_prom)) promoProductsByPromo.set(pp.id_prom, []);
    promoProductsByPromo.get(pp.id_prom).push(pp);
  }

  /*Construye los grupos de personalización de un producto considerando sus exclusiones y extras asociados.*/
  const buildGroupsForProduct = (idDetalle) => {
    const exclusiones = exclusionsByDetalle.get(idDetalle) || [];
    const extrasTxt = extrasByDetalleNoProd.get(idDetalle) || [];
    if (exclusiones.length === 0 && extrasTxt.length === 0) return [];
    return [{ producto: null, cantidad: null, exclusiones, extras: extrasTxt }];
  };

  /*Construye y agrupa las personalizaciones de los productos incluidos en una promoción según sus exclusiones y extras por unidad.*/
  const buildGroupsForPromoProduct = (idDetalle, idProd, nombreProducto) => {
    const dpKey = `${idDetalle}|${idProd}`;
    const exclUnitMap = exclusionsPromoByDetProd.get(dpKey) || new Map();
    const extraUnitMap = extrasPromoByDetProd.get(dpKey) || new Map();
    const units = new Set([...exclUnitMap.keys(), ...extraUnitMap.keys()]);
    const groups = new Map();
    for (const unit of units) {
      const exclusiones = (exclUnitMap.get(unit) || []).slice().sort();
      const extras = (extraUnitMap.get(unit) || []).slice().sort();
      const key = `${exclusiones.join(',')}|${extras.join(',')}`;
      if (!groups.has(key)) groups.set(key, { cantidad: 0, exclusiones, extras, producto: nombreProducto });
      groups.get(key).cantidad += 1;
    }
    return Array.from(groups.values());
  };

  const detallesByVenta = new Map();
  for (const d of allDetalles) {
    if (!detallesByVenta.has(d.id_venta)) detallesByVenta.set(d.id_venta, []);
    detallesByVenta.get(d.id_venta).push(d);
  }

  return ventas.map((v) => {
    const pago = pagosByVenta.get(v.id_venta) || { efectivo: 0, qr: 0, total: 0 };
    const detallesForVenta = detallesByVenta.get(v.id_venta) || [];

    const itemsGrouped = new Map();
    for (const det of detallesForVenta) {
      const mesero = aliasById.get(det.id_mesero_actual) || '—';
      let producto;
      let personalizacionGrupos;
      if (det.id_prod) {
        producto = det.nom_prod;
        personalizacionGrupos = buildGroupsForProduct(det.id_detalle_venta);
      } else {
        producto = det.nom_prom;
        const productos = promoProductsByPromo.get(det.id_prom) || [];
        personalizacionGrupos = productos.flatMap((pp) => buildGroupsForPromoProduct(det.id_detalle_venta, pp.id_prod, pp.nom_prod));
      }

      const key = `${producto}|${det.tipo_consumo}|${mesero}|${JSON.stringify(personalizacionGrupos)}`;
      if (!itemsGrouped.has(key)) {
        itemsGrouped.set(key, { producto, cantidad: 0, tipoConsumo: det.tipo_consumo, subtotal: 0, mesero, personalizacionGrupos });
      }
      const entry = itemsGrouped.get(key);
      entry.cantidad += det.cantidad_prod_det;
      entry.subtotal += Number(det.subtotal);
    }
    const items = Array.from(itemsGrouped.values());

    return {
      idVenta: v.id_venta,
      numVenta: v.num_venta,
      fecha: toIsoString(v.fecha_reg),
      hora: v.hora_reg,
      meseroApertura: aliasById.get(v.cod_emp) || '—',
      cajero: v.cod_emp2 ? (aliasById.get(v.cod_emp2) || '—') : 'DIRECTORIO',
      salon: v.nomb_seccion || 'N/A',
      mesa: v.id_mesa || 'N/A',
      total: Number(v.total_venta),
      efectivo: pago.efectivo,
      qr: pago.qr,
      totalPagado: pago.total,
      estado: estadoByVenta.get(v.id_venta) || 'Finalizada',
      items
    };
  });
};

/*Obtiene un resumen de las ventas agrupado por fecha y cajero, incluyendo cantidades, montos y métodos de pago.*/
export const getSummaryByDateReport = async (fechaInicio, fechaFin, empleadoId) => {
  const ventas = await getDetailedSalesReport(fechaInicio, fechaFin, empleadoId);
  const grouped = new Map();
  for (const v of ventas) {
    const fechaDia = v.fecha.slice(0, 10);
    const key = `${fechaDia}|${v.cajero}`;
    if (!grouped.has(key)) {
      grouped.set(key, { fecha: fechaDia, cajero: v.cajero, totalVentas: 0, totalMonto: 0, efectivo: 0, qr: 0 });
    }
    const entry = grouped.get(key);
    entry.totalVentas += 1;
    entry.totalMonto += v.total;
    entry.efectivo += v.efectivo;
    entry.qr += v.qr;
  }
  const rows = Array.from(grouped.values()).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.cajero.localeCompare(b.cajero));
  const granTotal = rows.reduce((sum, r) => sum + r.totalMonto, 0);
  return { rows, granTotal };
};

/*Genera un reporte de productos y promociones vendidos, calculando cantidades, ingresos, costos y ganancias.*/
export const getTopProductsReport = async (fechaInicio, fechaFin) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);

  const detallesResult = await query(
    `SELECT dv.id_prod, dv.id_prom, dv.cantidad_prod_det, dv.subtotal, p.nom_prod, p.costo_fabricacion, pr.nom_prom
     FROM detalles_venta dv
     LEFT JOIN producto p ON p.id_prod = dv.id_prod
     LEFT JOIN promocion pr ON pr.id_prom = dv.id_prom
     WHERE dv.fecha_reg_detalle_venta >= $1 AND dv.fecha_reg_detalle_venta < $2 AND dv.estado_detalle_venta = 'Finalizado'`,
    [start, end]
  );

  const productRows = detallesResult.rows.filter((d) => d.id_prod);
  const promoRows = detallesResult.rows.filter((d) => d.id_prom);

  const productMap = new Map();
  for (const d of productRows) {
    if (!productMap.has(d.id_prod)) {
      productMap.set(d.id_prod, {
        nombre: d.nom_prod || 'N/A',
        cantidad: 0,
        ingreso: 0,
        costoUnitario: Number(d.costo_fabricacion || 0)
      });
    }
    const entry = productMap.get(d.id_prod);
    entry.cantidad += d.cantidad_prod_det;
    entry.ingreso += Number(d.subtotal);
  }

  const allProductsResult = await query(`SELECT id_prod, nom_prod, costo_fabricacion FROM producto`);
  for (const p of allProductsResult.rows) {
    if (!productMap.has(p.id_prod)) {
      productMap.set(p.id_prod, {
        nombre: p.nom_prod,
        cantidad: 0,
        ingreso: 0,
        costoUnitario: Number(p.costo_fabricacion || 0)
      });
    }
  }

  const productosResult = Array.from(productMap.values()).map((p) => {
    const costo = p.costoUnitario * p.cantidad;
    return { tipo: 'producto', nombre: p.nombre, cantidad: p.cantidad, ingreso: p.ingreso, costo, ganancia: p.ingreso - costo };
  });

  const promoMap = new Map();
  for (const d of promoRows) {
    if (!promoMap.has(d.id_prom)) {
      promoMap.set(d.id_prom, { nombre: d.nom_prom || 'N/A', cantidad: 0, ingreso: 0 });
    }
    const entry = promoMap.get(d.id_prom);
    entry.cantidad += d.cantidad_prod_det;
    entry.ingreso += Number(d.subtotal);
  }

  const promoIds = Array.from(promoMap.keys());
  const promoProductsRowsResult = promoIds.length
    ? await query(
        `SELECT pp.id_prom, pp.id_prod, pp.cantidad_prod_prom, p.nom_prod, p.costo_fabricacion
         FROM promocion_prod pp JOIN producto p ON p.id_prod = pp.id_prod
         WHERE pp.id_prom = ANY($1::bigint[])`,
        [promoIds]
      )
    : { rows: [] };

  const promoProductsByPromo = new Map();
  for (const pp of promoProductsRowsResult.rows) {
    if (!promoProductsByPromo.has(pp.id_prom)) promoProductsByPromo.set(pp.id_prom, []);
    promoProductsByPromo.get(pp.id_prom).push(pp);
  }

  const promocionesResult = Array.from(promoMap.entries()).map(([idProm, p]) => {
    const componentes = promoProductsByPromo.get(idProm) || [];
    const costo = componentes.reduce((sum, c) => {
      const costoUnitario = Number(c.costo_fabricacion || 0);
      return sum + costoUnitario * c.cantidad_prod_prom * p.cantidad;
    }, 0);
    const productosConsumidos = componentes.map((c) => ({
      nombre: c.nom_prod || 'N/A',
      cantidad: c.cantidad_prod_prom * p.cantidad
    }));
    return {
      tipo: 'promocion',
      nombre: p.nombre,
      cantidad: p.cantidad,
      ingreso: p.ingreso,
      costo,
      ganancia: p.ingreso - costo,
      productosConsumidos
    };
  });

  return [...productosResult, ...promocionesResult].sort((a, b) => b.cantidad - a.cantidad);
};

/*Genera los datos para un gráfico de ventas agrupando la cantidad de ventas según el cajero o mesero seleccionado.*/
export const getEmployeeChartReport = async (fechaInicio, fechaFin, tipo) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);
  const ventasResult = await query(
    `SELECT id_venta, cod_emp2 FROM venta WHERE fecha_reg >= $1 AND fecha_reg < $2`,
    [start, end]
  );

  const countByEmp = new Map();
  if (tipo === 'cajero') {
    for (const v of ventasResult.rows) {
      const key = v.cod_emp2 ? Number(v.cod_emp2) : -1;
      countByEmp.set(key, (countByEmp.get(key) || 0) + 1);
    }
  } else {
    const ventaIds = ventasResult.rows.map((v) => v.id_venta);
    if (ventaIds.length > 0) {
      const detallesResult = await query(
        `SELECT id_venta, id_mesero_actual FROM detalles_venta WHERE id_venta = ANY($1::bigint[])`,
        [ventaIds]
      );
      const participaciones = new Set();
      for (const d of detallesResult.rows) {
        participaciones.add(`${d.id_venta}|${d.id_mesero_actual}`);
      }
      for (const par of participaciones) {
        const mesero = Number(par.split('|')[1]);
        countByEmp.set(mesero, (countByEmp.get(mesero) || 0) + 1);
      }
    }
  }

  const empleadoIds = Array.from(countByEmp.keys()).filter((id) => id !== -1);
  const empleadosResult = empleadoIds.length
    ? await query(`SELECT cod_emp, alias_emp FROM empleado WHERE cod_emp = ANY($1::bigint[])`, [empleadoIds])
    : { rows: [] };
  const aliasById = new Map(empleadosResult.rows.map((e) => [Number(e.cod_emp), e.alias_emp]));

  const rows = Array.from(countByEmp.entries()).map(([id, count]) => ({
    empleado: id === -1 ? 'DIRECTORIO' : (aliasById.get(id) || '—'),
    totalVentas: count
  }));
  return rows.sort((a, b) => b.totalVentas - a.totalVentas);
};

/* NOTA: sin usar por ningún componente del frontend todavía (queda disponible por si se conecta a futuro). */
/*Obtiene las ventas en las que participa un empleado como cajero o mesero dentro de un rango de fechas.*/
export const getEmployeeSalesReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);
  const idNum = Number(empleadoId);

  const comoCajeroResult = idNum === -1
    ? await query(`SELECT id_venta, num_venta, fecha_reg, hora_reg, total_venta FROM venta WHERE fecha_reg >= $1 AND fecha_reg < $2 AND cod_emp2 IS NULL`, [start, end])
    : await query(`SELECT id_venta, num_venta, fecha_reg, hora_reg, total_venta FROM venta WHERE fecha_reg >= $1 AND fecha_reg < $2 AND cod_emp2 = $3`, [start, end, idNum]);

  const comoMeseroResult = idNum === -1
    ? { rows: [] }
    : await query(`SELECT id_venta, num_venta, fecha_reg, hora_reg, total_venta FROM venta WHERE fecha_reg >= $1 AND fecha_reg < $2 AND cod_emp = $3`, [start, end, idNum]);

  const rows = [
    ...comoCajeroResult.rows.map((v) => ({ ...v, rol: 'Cajero' })),
    ...comoMeseroResult.rows.map((v) => ({ ...v, rol: 'Mesero' }))
  ];

  return rows
    .map((v) => ({
      idVenta: v.id_venta,
      numVenta: v.num_venta,
      fecha: toIsoString(v.fecha_reg),
      hora: v.hora_reg,
      rol: v.rol,
      total: Number(v.total_venta)
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
};
