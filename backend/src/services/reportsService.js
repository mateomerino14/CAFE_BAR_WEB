import { supabase } from '../config/supabaseClient.js';


const getDateRangeISO = (fechaInicio, fechaFin) => {
  const start = new Date(`${fechaInicio}T04:00:00.000Z`);
  const endBase = new Date(`${fechaFin}T04:00:00.000Z`);
  const end = new Date(endBase.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
};

const getEstadoByVenta = async (ventaIds) => {
  if (ventaIds.length === 0) return new Map();
  const { data: detalles } = await supabase.from('detalles_venta').select('id_venta, estado_detalle_venta').in('id_venta', ventaIds);
  const estadoByVenta = new Map();
  for (const d of detalles || []) {
    if (d.estado_detalle_venta === 'PENDIENTE') estadoByVenta.set(d.id_venta, 'En Preparación');
    else if (!estadoByVenta.has(d.id_venta)) estadoByVenta.set(d.id_venta, 'Finalizada');
  }
  return estadoByVenta;
};

export const listEmployeesForReports = async () => {
  const { data } = await supabase.from('empleado').select('cod_emp, alias_emp').order('alias_emp');
  return [{ codEmp: -1, alias: 'DIRECTORIO' }, ...(data || []).map((e) => ({ codEmp: e.cod_emp, alias: e.alias_emp }))];
};


export const getDetailedSalesReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);

  let query = supabase
    .from('venta')
    .select('id_venta, num_venta, fecha_reg, hora_reg, total_venta, id_mesa, cod_emp, cod_emp2, seccion:seccion(nomb_seccion)')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end)
    .order('fecha_reg')
    .order('hora_reg');

  if (empleadoId !== undefined && empleadoId !== null && empleadoId !== '') {
    const idNum = Number(empleadoId);
    if (idNum === -1) query = query.is('cod_emp2', null);
    else query = query.eq('cod_emp2', idNum);
  }

  const { data: ventas } = await query;
  if (!ventas || ventas.length === 0) return [];

  const ventaIds = ventas.map((v) => v.id_venta);
  const estadoByVenta = await getEstadoByVenta(ventaIds);

  const { data: pagos } = await supabase.from('pago').select('id_venta, id_metodo, monto').in('id_venta', ventaIds);
  const { data: metodos } = await supabase.from('metodo_pago').select('id_metodo, nombre');
  const efectivoId = (metodos || []).find((m) => m.nombre.toLowerCase() === 'efectivo')?.id_metodo;
  const qrId = (metodos || []).find((m) => m.nombre.toLowerCase() === 'qr')?.id_metodo;

  const pagosByVenta = new Map();
  for (const p of pagos || []) {
    if (!pagosByVenta.has(p.id_venta)) pagosByVenta.set(p.id_venta, { efectivo: 0, qr: 0, total: 0 });
    const entry = pagosByVenta.get(p.id_venta);
    entry.total += Number(p.monto);
    if (p.id_metodo === efectivoId) entry.efectivo += Number(p.monto);
    if (p.id_metodo === qrId) entry.qr += Number(p.monto);
  }

  const { data: allDetalles } = await supabase
    .from('detalles_venta')
    .select('id_detalle_venta, id_venta, id_prod, id_prom, cantidad_prod_det, tipo_consumo, subtotal, id_mesero_actual, producto:producto(nom_prod), promocion:promocion(nom_prom)')
    .in('id_venta', ventaIds);

  const empleadoIds = [...new Set([
    ...ventas.flatMap((v) => [v.cod_emp, v.cod_emp2]),
    ...(allDetalles || []).map((d) => d.id_mesero_actual)
  ].filter(Boolean))];
  const { data: empleados } = empleadoIds.length
    ? await supabase.from('empleado').select('cod_emp, alias_emp').in('cod_emp', empleadoIds)
    : { data: [] };
  const aliasById = new Map((empleados || []).map((e) => [e.cod_emp, e.alias_emp]));

  const detalleIds = (allDetalles || []).map((d) => d.id_detalle_venta);
  const productDetalleIds = (allDetalles || []).filter((d) => d.id_prod).map((d) => d.id_detalle_venta);
  const promoDetalleIds = (allDetalles || []).filter((d) => d.id_prom).map((d) => d.id_detalle_venta);
  const promoIds = [...new Set((allDetalles || []).filter((d) => d.id_prom).map((d) => d.id_prom))];

  const [
    { data: exclusions },
    { data: extras },
    { data: exclusionsPromo },
    { data: promoProductsRows }
  ] = await Promise.all([
    productDetalleIds.length
      ? supabase.from('detalles_venta_exclusiones').select('id_detalle_venta, nom_ing').in('id_detalle_venta', productDetalleIds)
      : Promise.resolve({ data: [] }),
    detalleIds.length
      ? supabase.from('detalles_venta_extras').select('id_detalle_venta, id_prod, nom_ing, cantidad_extra, num_unidad').in('id_detalle_venta', detalleIds)
      : Promise.resolve({ data: [] }),
    promoDetalleIds.length
      ? supabase.from('detalles_venta_exclusiones_promo').select('id_detalle_venta, id_prod, nom_ing, num_unidad').in('id_detalle_venta', promoDetalleIds)
      : Promise.resolve({ data: [] }),
    promoIds.length
      ? supabase.from('promocion_prod').select('id_prom, id_prod, producto:producto(nom_prod)').in('id_prom', promoIds)
      : Promise.resolve({ data: [] })
  ]);

  const exclusionsByDetalle = new Map();
  for (const e of exclusions || []) {
    if (!exclusionsByDetalle.has(e.id_detalle_venta)) exclusionsByDetalle.set(e.id_detalle_venta, []);
    exclusionsByDetalle.get(e.id_detalle_venta).push(e.nom_ing);
  }

  const extrasByDetalleNoProd = new Map();
  const extrasPromoByDetProd = new Map();
  for (const e of extras || []) {
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
  for (const e of exclusionsPromo || []) {
    const dpKey = `${e.id_detalle_venta}|${e.id_prod}`;
    if (!exclusionsPromoByDetProd.has(dpKey)) exclusionsPromoByDetProd.set(dpKey, new Map());
    const unitMap = exclusionsPromoByDetProd.get(dpKey);
    if (!unitMap.has(e.num_unidad)) unitMap.set(e.num_unidad, []);
    unitMap.get(e.num_unidad).push(e.nom_ing);
  }

  const promoProductsByPromo = new Map();
  for (const pp of promoProductsRows || []) {
    if (!promoProductsByPromo.has(pp.id_prom)) promoProductsByPromo.set(pp.id_prom, []);
    promoProductsByPromo.get(pp.id_prom).push(pp);
  }

  const buildGroupsForProduct = (idDetalle) => {
    const exclusiones = exclusionsByDetalle.get(idDetalle) || [];
    const extrasTxt = extrasByDetalleNoProd.get(idDetalle) || [];
    if (exclusiones.length === 0 && extrasTxt.length === 0) return [];
    return [{ producto: null, cantidad: null, exclusiones, extras: extrasTxt }];
  };

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
  for (const d of allDetalles || []) {
    if (!detallesByVenta.has(d.id_venta)) detallesByVenta.set(d.id_venta, []);
    detallesByVenta.get(d.id_venta).push(d);
  }

  return ventas.map((v) => {
    const pago = pagosByVenta.get(v.id_venta) || { efectivo: 0, qr: 0, total: 0 };
    const detallesForVenta = detallesByVenta.get(v.id_venta) || [];

    const items = detallesForVenta.map((det) => {
      const mesero = aliasById.get(det.id_mesero_actual) || '—';

      if (det.id_prod) {
        return {
          producto: det.producto?.nom_prod,
          cantidad: det.cantidad_prod_det,
          tipoConsumo: det.tipo_consumo,
          subtotal: det.subtotal,
          mesero,
          personalizacionGrupos: buildGroupsForProduct(det.id_detalle_venta)
        };
      }

      const productos = promoProductsByPromo.get(det.id_prom) || [];
      const grupos = productos.flatMap((pp) => buildGroupsForPromoProduct(det.id_detalle_venta, pp.id_prod, pp.producto?.nom_prod));

      return {
        producto: det.promocion?.nom_prom,
        cantidad: det.cantidad_prod_det,
        tipoConsumo: det.tipo_consumo,
        subtotal: det.subtotal,
        mesero,
        personalizacionGrupos: grupos
      };
    });

    return {
      idVenta: v.id_venta,
      numVenta: v.num_venta,
      fecha: v.fecha_reg,
      hora: v.hora_reg,
      meseroApertura: aliasById.get(v.cod_emp) || '—',
      cajero: v.cod_emp2 ? (aliasById.get(v.cod_emp2) || '—') : 'DIRECTORIO',
      salon: v.seccion?.nomb_seccion || 'N/A',
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

export const getTopProductsReport = async (fechaInicio, fechaFin) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);

  const { data: detalles } = await supabase
    .from('detalles_venta')
    .select('id_prod, id_prom, cantidad_prod_det, subtotal, producto:producto(nom_prod, costo_fabricacion), promocion:promocion(nom_prom)')
    .gte('fecha_reg_detalle_venta', start)
    .lt('fecha_reg_detalle_venta', end)
    .eq('estado_detalle_venta', 'Finalizado');

  const productRows = (detalles || []).filter((d) => d.id_prod);
  const promoRows = (detalles || []).filter((d) => d.id_prom);

  const productMap = new Map();
  for (const d of productRows) {
    if (!productMap.has(d.id_prod)) {
      productMap.set(d.id_prod, {
        nombre: d.producto?.nom_prod || 'N/A',
        cantidad: 0,
        ingreso: 0,
        costoUnitario: Number(d.producto?.costo_fabricacion || 0)
      });
    }
    const entry = productMap.get(d.id_prod);
    entry.cantidad += d.cantidad_prod_det;
    entry.ingreso += Number(d.subtotal);
  }

  const { data: allProducts } = await supabase.from('producto').select('id_prod, nom_prod, costo_fabricacion');
  for (const p of allProducts || []) {
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
    return {
      tipo: 'producto',
      nombre: p.nombre,
      cantidad: p.cantidad,
      ingreso: p.ingreso,
      costo,
      ganancia: p.ingreso - costo
    };
  });

  const promoMap = new Map();
  for (const d of promoRows) {
    if (!promoMap.has(d.id_prom)) {
      promoMap.set(d.id_prom, { nombre: d.promocion?.nom_prom || 'N/A', cantidad: 0, ingreso: 0 });
    }
    const entry = promoMap.get(d.id_prom);
    entry.cantidad += d.cantidad_prod_det;
    entry.ingreso += Number(d.subtotal);
  }

  const promoIds = Array.from(promoMap.keys());
  const { data: promoProductsRows } = promoIds.length
    ? await supabase
        .from('promocion_prod')
        .select('id_prom, id_prod, cantidad_prod_prom, producto:producto(nom_prod, costo_fabricacion)')
        .in('id_prom', promoIds)
    : { data: [] };

  const promoProductsByPromo = new Map();
  for (const pp of promoProductsRows || []) {
    if (!promoProductsByPromo.has(pp.id_prom)) promoProductsByPromo.set(pp.id_prom, []);
    promoProductsByPromo.get(pp.id_prom).push(pp);
  }

  const promocionesResult = Array.from(promoMap.entries()).map(([idProm, p]) => {
    const componentes = promoProductsByPromo.get(idProm) || [];
    const costo = componentes.reduce((sum, c) => {
      const costoUnitario = Number(c.producto?.costo_fabricacion || 0);
      return sum + costoUnitario * c.cantidad_prod_prom * p.cantidad;
    }, 0);

    const productosConsumidos = componentes.map((c) => ({
      nombre: c.producto?.nom_prod || 'N/A',
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

export const getEmployeeChartReport = async (fechaInicio, fechaFin, tipo) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);

  const { data: ventas } = await supabase
    .from('venta')
    .select('id_venta, cod_emp2')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end);

  const countByEmp = new Map();

  if (tipo === 'cajero') {
    for (const v of ventas || []) {
      const key = v.cod_emp2 || -1;
      countByEmp.set(key, (countByEmp.get(key) || 0) + 1);
    }
  } else {
    const ventaIds = (ventas || []).map((v) => v.id_venta);

    if (ventaIds.length > 0) {
      const { data: detalles } = await supabase
        .from('detalles_venta')
        .select('id_venta, id_mesero_actual')
        .in('id_venta', ventaIds);

      const participaciones = new Set();
      for (const d of detalles || []) {
        participaciones.add(`${d.id_venta}|${d.id_mesero_actual}`);
      }

      for (const par of participaciones) {
        const mesero = Number(par.split('|')[1]);
        countByEmp.set(mesero, (countByEmp.get(mesero) || 0) + 1);
      }
    }
  }

  const empleadoIds = Array.from(countByEmp.keys()).filter((id) => id !== -1);
  const { data: empleados } = empleadoIds.length
    ? await supabase.from('empleado').select('cod_emp, alias_emp').in('cod_emp', empleadoIds)
    : { data: [] };
  const aliasById = new Map((empleados || []).map((e) => [e.cod_emp, e.alias_emp]));

  const rows = Array.from(countByEmp.entries()).map(([id, count]) => ({
    empleado: id === -1 ? 'DIRECTORIO' : (aliasById.get(id) || '—'),
    totalVentas: count
  }));

  return rows.sort((a, b) => b.totalVentas - a.totalVentas);
};

export const getEmployeeSalesReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { start, end } = getDateRangeISO(fechaInicio, fechaFin);
  const idNum = Number(empleadoId);

  const cajeroQuery = supabase
    .from('venta')
    .select('id_venta, num_venta, fecha_reg, hora_reg, total_venta')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end);

  const meseroQuery = supabase
    .from('venta')
    .select('id_venta, num_venta, fecha_reg, hora_reg, total_venta')
    .gte('fecha_reg', start)
    .lt('fecha_reg', end);

  const { data: comoCajero } = idNum === -1
    ? await cajeroQuery.is('cod_emp2', null)
    : await cajeroQuery.eq('cod_emp2', idNum);

  const { data: comoMesero } = idNum === -1
    ? { data: [] }
    : await meseroQuery.eq('cod_emp', idNum);

  const rows = [
    ...(comoCajero || []).map((v) => ({ ...v, rol: 'Cajero' })),
    ...(comoMesero || []).map((v) => ({ ...v, rol: 'Mesero' }))
  ];

  return rows
    .map((v) => ({
      idVenta: v.id_venta,
      numVenta: v.num_venta,
      fecha: v.fecha_reg,
      hora: v.hora_reg,
      rol: v.rol,
      total: Number(v.total_venta)
    }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));
};