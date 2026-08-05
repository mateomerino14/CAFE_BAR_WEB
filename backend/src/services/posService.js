import { supabase } from '../config/supabaseClient.js';
import { verifyPassword } from '../utils/password.js';

export const listSectionsWithTables = async () => {
  const { data: sections } = await supabase.from('seccion').select('id_seccion, nomb_seccion').order('nomb_seccion');
  const { data: tables } = await supabase.from('mesa').select('id_mesa, id_seccion, disponible').eq('existe', true).order('id_mesa');

  return (sections || []).map((section) => ({
    ...section,
    mesas: (tables || []).filter((table) => table.id_seccion === section.id_seccion)
  }));
};

const getDailySaleNumber = async () => {
  const now = new Date();
  const bolivianShifted = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const year = bolivianShifted.getUTCFullYear();
  const month = bolivianShifted.getUTCMonth();
  const day = bolivianShifted.getUTCDate();
  const startOfDayBolivia = new Date(Date.UTC(year, month, day, 4, 0, 0, 0));
  const { count } = await supabase
    .from('venta')
    .select('*', { count: 'exact', head: true })
    .gte('fecha_reg', startOfDayBolivia.toISOString());
  return (count || 0) + 1;
};
export const getNextSaleNumberPreview = async () => getDailySaleNumber();

const buildStockRequirements = async (items) => {
  const neededByIngredient = new Map();
  const addNeed = (idIng, amount) => neededByIngredient.set(idIng, (neededByIngredient.get(idIng) || 0) + amount);

  for (const item of items) {
    if (item.type === 'product') {
      const exclusionIds = (item.exclusiones || []).map((e) => e.idIng);
      const { data: ingredients } = await supabase
        .from('productos_ingredientes')
        .select('id_ing, cantidad_ing_necesitada')
        .eq('id_prod', item.idProd);

      for (const row of ingredients || []) {
        if (exclusionIds.includes(row.id_ing)) continue;
        addNeed(row.id_ing, Number(row.cantidad_ing_necesitada) * item.cantidad);
      }

      for (const extra of item.extras || []) {
        addNeed(extra.idIng, Number(extra.cantidadExtra) * item.cantidad);
      }
    } else {
      const { data: promProducts } = await supabase
        .from('promocion_prod')
        .select('id_prod, cantidad_prod_prom')
        .eq('id_prom', item.idProm);

      const customizationByProduct = new Map((item.productCustomizations || []).map((pc) => [pc.idProd, pc]));

      for (const pp of promProducts || []) {
        const { data: ingredients } = await supabase
          .from('productos_ingredientes')
          .select('id_ing, cantidad_ing_necesitada')
          .eq('id_prod', pp.id_prod);

        const customization = customizationByProduct.get(pp.id_prod);

        if (!customization?.unitGroups?.length) {
          for (const row of ingredients || []) {
            addNeed(row.id_ing, Number(row.cantidad_ing_necesitada) * pp.cantidad_prod_prom * item.cantidad);
          }
          continue;
        }

        for (const group of customization.unitGroups) {
          const exclusionIds = (group.exclusiones || []).map((e) => e.idIng);

          for (const row of ingredients || []) {
            if (exclusionIds.includes(row.id_ing)) continue;
            addNeed(row.id_ing, Number(row.cantidad_ing_necesitada) * group.cantidad);
          }

          for (const extra of group.extras || []) {
            addNeed(extra.idIng, Number(extra.cantidadExtra) * group.cantidad);
          }
        }
      }
    }
  }

  return neededByIngredient;
};

export const computeStockRequirements = async (items) => buildStockRequirements(items);

export const deductStock = async (neededByIngredient) => {
  for (const [idIng, needed] of neededByIngredient) {
    const { data: stockRow } = await supabase.from('stock').select('cantidad_stock').eq('id_ing', idIng).single();
    const newStock = Math.max(0, (Number(stockRow?.cantidad_stock) || 0) - needed);
    await supabase.from('stock').update({ cantidad_stock: newStock }).eq('id_ing', idIng);
  }
};

export const createOrGetVenta = async ({ idMesa, idSeccion, idMesero, idCajero }) => {
  const { data: table } = await supabase
    .from('mesa')
    .select('disponible')
    .eq('id_mesa', idMesa)
    .eq('id_seccion', idSeccion)
    .single();

  if (table.disponible) {
    const numVenta = await getDailySaleNumber();
    const { data: venta, error } = await supabase
      .from('venta')
      .insert({
        num_venta: numVenta,
        cod_emp: idMesero,
        cod_emp2: idCajero,
        total_venta: 0,
        id_mesa: idMesa,
        id_seccion: idSeccion
      })
      .select('id_venta, num_venta')
      .single();

    if (error) throw error;

    await supabase.from('mesa').update({ disponible: false }).eq('id_mesa', idMesa).eq('id_seccion', idSeccion);

    return { idVenta: venta.id_venta, numVenta: venta.num_venta };
  }

  const { data: venta } = await supabase
    .from('venta')
    .select('id_venta, num_venta')
    .eq('id_mesa', idMesa)
    .eq('id_seccion', idSeccion)
    .order('fecha_reg', { ascending: false })
    .limit(1)
    .single();

  return { idVenta: venta.id_venta, numVenta: venta.num_venta };
};

const insertUnits = async (idDetalle, idProd, cantidad, startIndex = 0) => {
  const rows = Array.from({ length: cantidad }, (_, index) => ({
    id_detalle_venta: idDetalle,
    num_unidad: startIndex + index,
    marcado: false,
    id_prod: idProd
  }));
  await supabase.from('detalles_venta_unidades').insert(rows);
};

const insertProductItem = async (idVenta, idMesero, item, batchFecha) => {
  const { data: product } = await supabase.from('producto').select('precio_venta').eq('id_prod', item.idProd).single();
  if (!product) throw new Error('PRODUCT_NOT_FOUND');

  const extraCost = (item.extras || []).reduce((sum, extra) => sum + Number(extra.precioExtra) * Number(extra.cantidadExtra), 0);
  const unitPrice = Number(product.precio_venta) + extraCost;
  const subtotal = unitPrice * item.cantidad;

  const { data: detalle, error } = await supabase
    .from('detalles_venta')
    .insert({
      id_venta: idVenta,
      id_prod: item.idProd,
      subtotal,
      cantidad_prod_det: item.cantidad,
      tipo_consumo: item.tipoConsumo || 'Local',
      estado_detalle_venta: 'PENDIENTE',
      id_mesero_actual: idMesero,
      fecha_reg_detalle_venta: batchFecha
    })
    .select('id_detalle_venta')
    .single();

  if (error) throw error;

  await insertUnits(detalle.id_detalle_venta, item.idProd, item.cantidad);

  if (item.exclusiones?.length) {
    const rows = item.exclusiones.map((e) => ({ id_detalle_venta: detalle.id_detalle_venta, id_ing: e.idIng, nom_ing: e.nomIng }));
    await supabase.from('detalles_venta_exclusiones').insert(rows);
  }

  if (item.extras?.length) {
    const rows = item.extras.map((e) => ({
      id_detalle_venta: detalle.id_detalle_venta,
      id_ing: e.idIng,
      nom_ing: e.nomIng,
      cantidad_extra: e.cantidadExtra,
      precio_extra: e.precioExtra
    }));
    await supabase.from('detalles_venta_extras').insert(rows);
  }

  return subtotal;
};

const insertPromotionItem = async (idVenta, idMesero, item, batchFecha) => {
  const { data: promotion } = await supabase.from('promocion').select('precio_prom').eq('id_prom', item.idProm).single();
  if (!promotion) throw new Error('PROMOTION_NOT_FOUND');

  const customizationByProduct = new Map((item.productCustomizations || []).map((pc) => [pc.idProd, pc]));

  const extraCost = (item.productCustomizations || []).reduce((sum, pc) => {
    return sum + (pc.unitGroups || []).reduce((s, g) => {
      const groupExtraCost = (g.extras || []).reduce((es, e) => es + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
      return s + groupExtraCost * g.cantidad;
    }, 0);
  }, 0);

  const subtotal = Number(promotion.precio_prom) * item.cantidad + extraCost;

  const { data: detalle, error } = await supabase
    .from('detalles_venta')
    .insert({
      id_venta: idVenta,
      id_prom: item.idProm,
      subtotal,
      cantidad_prod_det: item.cantidad,
      tipo_consumo: item.tipoConsumo || 'Local',
      estado_detalle_venta: 'PENDIENTE',
      id_mesero_actual: idMesero,
      fecha_reg_detalle_venta: batchFecha
    })
    .select('id_detalle_venta')
    .single();

  if (error) throw error;

  const { data: promProducts } = await supabase
    .from('promocion_prod')
    .select('id_prod, cantidad_prod_prom')
    .eq('id_prom', item.idProm);

  let globalUnitIndex = 0;
  for (const pp of promProducts || []) {
    const totalUnits = pp.cantidad_prod_prom * item.cantidad;
    await insertUnits(detalle.id_detalle_venta, pp.id_prod, totalUnits, globalUnitIndex);

    const customization = customizationByProduct.get(pp.id_prod);

    if (customization?.unitGroups?.length) {
      let localUnitIndex = globalUnitIndex;
      for (const group of customization.unitGroups) {
        for (let i = 0; i < group.cantidad; i += 1) {
          const numUnidad = localUnitIndex + i;

          if (group.exclusiones?.length) {
            const rows = group.exclusiones.map((e) => ({
              id_detalle_venta: detalle.id_detalle_venta,
              id_prod: pp.id_prod,
              id_ing: e.idIng,
              nom_ing: e.nomIng,
              num_unidad: numUnidad
            }));
            await supabase.from('detalles_venta_exclusiones_promo').insert(rows);
          }

          if (group.extras?.length) {
            const rows = group.extras.map((e) => ({
              id_detalle_venta: detalle.id_detalle_venta,
              id_ing: e.idIng,
              nom_ing: e.nomIng,
              cantidad_extra: e.cantidadExtra,
              precio_extra: e.precioExtra,
              id_prod: pp.id_prod,
              num_unidad: numUnidad
            }));
            await supabase.from('detalles_venta_extras').insert(rows);
          }
        }
        localUnitIndex += group.cantidad;
      }
    }

    globalUnitIndex += totalUnits;
  }

  return subtotal;
};

export const addOrderItems = async (idVenta, idMesero, items, batchFecha) => {
  let totalAdded = 0;

  for (const item of items) {
    if (item.type === 'product') {
      totalAdded += await insertProductItem(idVenta, idMesero, item, batchFecha);
    } else {
      totalAdded += await insertPromotionItem(idVenta, idMesero, item, batchFecha);
    }
  }

  const { data: venta } = await supabase.from('venta').select('total_venta').eq('id_venta', idVenta).single();
  const newTotal = Number(venta.total_venta) + totalAdded;
  await supabase.from('venta').update({ total_venta: newTotal }).eq('id_venta', idVenta);

  return newTotal;
};

export const listPendingBatches = async (idMesa, idSeccion) => {
  const { data: venta } = await supabase
    .from('venta')
    .select('id_venta')
    .eq('id_mesa', idMesa)
    .eq('id_seccion', idSeccion)
    .order('fecha_reg', { ascending: false })
    .limit(1)
    .single();

  if (!venta) return [];

  const { data: detalles } = await supabase
    .from('detalles_venta')
    .select('id_detalle_venta, fecha_reg_detalle_venta, tipo_consumo, id_prod, id_prom, producto:producto(nom_prod), promocion:promocion(nom_prom)')
    .eq('id_venta', venta.id_venta)
    .eq('estado_detalle_venta', 'PENDIENTE');

  if (!detalles || detalles.length === 0) return [];

  const detalleIds = detalles.map((d) => d.id_detalle_venta);

  const { data: units } = await supabase
    .from('detalles_venta_unidades')
    .select('id_detalle_venta, marcado')
    .in('id_detalle_venta', detalleIds);

  const unitsByDetalle = new Map();
  for (const u of units || []) {
    if (!unitsByDetalle.has(u.id_detalle_venta)) unitsByDetalle.set(u.id_detalle_venta, { total: 0, restante: 0 });
    const counts = unitsByDetalle.get(u.id_detalle_venta);
    counts.total += 1;
    if (!u.marcado) counts.restante += 1;
  }

  const batches = new Map();

  for (const row of detalles) {
    const key = row.fecha_reg_detalle_venta;
    if (!batches.has(key)) batches.set(key, { fecha: key, items: [] });

    const counts = unitsByDetalle.get(row.id_detalle_venta) || { total: 0, restante: 0 };
    if (counts.restante <= 0) continue;

    batches.get(key).items.push({
      nombre: row.producto?.nom_prod || row.promocion?.nom_prom,
      tipo: row.tipo_consumo,
      total: counts.total,
      restante: counts.restante
    });
  }

  return Array.from(batches.values())
    .filter((batch) => batch.items.length > 0)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

export const getMarkCards = async (fecha) => {
  const { data: detalles } = await supabase
    .from('detalles_venta')
    .select('id_detalle_venta, tipo_consumo, id_prod, id_prom')
    .eq('fecha_reg_detalle_venta', fecha);

  if (!detalles || detalles.length === 0) return [];

  const detalleIds = detalles.map((d) => d.id_detalle_venta);
  const productDetalleIds = detalles.filter((d) => d.id_prod).map((d) => d.id_detalle_venta);
  const promoDetalleIds = detalles.filter((d) => d.id_prom).map((d) => d.id_detalle_venta);
  const productIds = [...new Set(detalles.filter((d) => d.id_prod).map((d) => d.id_prod))];
  const promoIds = [...new Set(detalles.filter((d) => d.id_prom).map((d) => d.id_prom))];

  const [
    { data: units },
    { data: exclusions },
    { data: extras },
    { data: exclusionsPromo },
    { data: productos },
    { data: promoProducts }
  ] = await Promise.all([
    supabase.from('detalles_venta_unidades').select('id_unidad, id_detalle_venta, id_prod, num_unidad, marcado').in('id_detalle_venta', detalleIds),
    productDetalleIds.length
      ? supabase.from('detalles_venta_exclusiones').select('id_detalle_venta, nom_ing').in('id_detalle_venta', productDetalleIds)
      : Promise.resolve({ data: [] }),
    detalleIds.length
      ? supabase.from('detalles_venta_extras').select('id_detalle_venta, id_prod, nom_ing, cantidad_extra, num_unidad').in('id_detalle_venta', detalleIds)
      : Promise.resolve({ data: [] }),
    promoDetalleIds.length
      ? supabase.from('detalles_venta_exclusiones_promo').select('id_detalle_venta, id_prod, nom_ing, num_unidad').in('id_detalle_venta', promoDetalleIds)
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase.from('producto').select('id_prod, nom_prod').in('id_prod', productIds)
      : Promise.resolve({ data: [] }),
    promoIds.length
      ? supabase.from('promocion_prod').select('id_prom, id_prod, producto:producto(nom_prod)').in('id_prom', promoIds)
      : Promise.resolve({ data: [] })
  ]);

  const productNameById = new Map((productos || []).map((p) => [p.id_prod, p.nom_prod]));

  const unitsByKey = new Map();
  for (const u of units || []) {
    const key = `${u.id_detalle_venta}|${u.id_prod}`;
    if (!unitsByKey.has(key)) unitsByKey.set(key, []);
    unitsByKey.get(key).push(u);
  }

  const exclusionsByDetalle = new Map();
  for (const e of exclusions || []) {
    if (!exclusionsByDetalle.has(e.id_detalle_venta)) exclusionsByDetalle.set(e.id_detalle_venta, []);
    exclusionsByDetalle.get(e.id_detalle_venta).push(e.nom_ing);
  }

  const extrasByDetalleNoProd = new Map();
  for (const e of extras || []) {
    if (e.id_prod) continue;
    if (!extrasByDetalleNoProd.has(e.id_detalle_venta)) extrasByDetalleNoProd.set(e.id_detalle_venta, []);
    extrasByDetalleNoProd.get(e.id_detalle_venta).push(`+${e.cantidad_extra} ${e.nom_ing}`);
  }

  const exclusionsPromoByUnit = new Map();
  for (const e of exclusionsPromo || []) {
    const key = `${e.id_detalle_venta}|${e.id_prod}|${e.num_unidad}`;
    if (!exclusionsPromoByUnit.has(key)) exclusionsPromoByUnit.set(key, []);
    exclusionsPromoByUnit.get(key).push(e.nom_ing);
  }

  const extrasPromoByUnit = new Map();
  for (const e of extras || []) {
    if (!e.id_prod || e.num_unidad === null || e.num_unidad === undefined) continue;
    const key = `${e.id_detalle_venta}|${e.id_prod}|${e.num_unidad}`;
    if (!extrasPromoByUnit.has(key)) extrasPromoByUnit.set(key, []);
    extrasPromoByUnit.get(key).push(`+${e.cantidad_extra} ${e.nom_ing}`);
  }

  const promoProductsByPromo = new Map();
  for (const pp of promoProducts || []) {
    if (!promoProductsByPromo.has(pp.id_prom)) promoProductsByPromo.set(pp.id_prom, []);
    promoProductsByPromo.get(pp.id_prom).push(pp);
  }

  const grupos = new Map();

  for (const det of detalles) {
    if (det.id_prod) {
      const nombre = productNameById.get(det.id_prod);
      const detUnits = unitsByKey.get(`${det.id_detalle_venta}|${det.id_prod}`) || [];
      const exclusionNames = (exclusionsByDetalle.get(det.id_detalle_venta) || []).slice().sort();
      const extrasText = (extrasByDetalleNoProd.get(det.id_detalle_venta) || []).join(', ');

      const key = `${nombre}|${det.tipo_consumo}|${exclusionNames.join(',')}|${extrasText}`;

      if (!grupos.has(key)) {
        grupos.set(key, { nombre, tipo: det.tipo_consumo, exclusiones: exclusionNames, extrasTexto: extrasText, pendientes: [], listos: [] });
      }

      const grupo = grupos.get(key);
      for (const unit of detUnits) {
        if (unit.marcado) grupo.listos.push(unit.id_unidad);
        else grupo.pendientes.push(unit.id_unidad);
      }
    } else if (det.id_prom) {
      const productosDePromo = promoProductsByPromo.get(det.id_prom) || [];

      for (const pp of productosDePromo) {
        const detUnits = unitsByKey.get(`${det.id_detalle_venta}|${pp.id_prod}`) || [];
        const nombre = pp.producto?.nom_prod;

        for (const unit of detUnits) {
          const unitKey = `${det.id_detalle_venta}|${pp.id_prod}|${unit.num_unidad}`;
          const exclusionNames = (exclusionsPromoByUnit.get(unitKey) || []).slice().sort();
          const extrasList = (extrasPromoByUnit.get(unitKey) || []).slice().sort();

          const key = `${nombre}|${det.tipo_consumo}|${exclusionNames.join(',')}|${extrasList.join(',')}`;

          if (!grupos.has(key)) {
            grupos.set(key, {
              nombre,
              tipo: det.tipo_consumo,
              exclusiones: exclusionNames,
              extrasTexto: extrasList.join(', '),
              pendientes: [],
              listos: []
            });
          }

          const grupo = grupos.get(key);
          if (unit.marcado) grupo.listos.push(unit.id_unidad);
          else grupo.pendientes.push(unit.id_unidad);
        }
      }
    }
  }

  return Array.from(grupos.values())
    .map((g) => ({ ...g, total: g.pendientes.length + g.listos.length }))
    .filter((g) => g.pendientes.length > 0);
};

export const markUnits = async (unitIds, marcado) => {
  await supabase.from('detalles_venta_unidades').update({ marcado }).in('id_unidad', unitIds);

  const { data: units } = await supabase.from('detalles_venta_unidades').select('id_detalle_venta').in('id_unidad', unitIds);
  const detalleIds = [...new Set((units || []).map((u) => u.id_detalle_venta))];

  const { data: allUnits } = await supabase
    .from('detalles_venta_unidades')
    .select('id_detalle_venta, marcado')
    .in('id_detalle_venta', detalleIds);

  const countsByDetalle = new Map();
  for (const unit of allUnits || []) {
    if (!unit.marcado) continue;
    countsByDetalle.set(unit.id_detalle_venta, (countsByDetalle.get(unit.id_detalle_venta) || 0) + 1);
  }

  await Promise.all(
    detalleIds.map((idDetalle) =>
      supabase.from('detalles_venta').update({ cantidad_marcado: countsByDetalle.get(idDetalle) || 0 }).eq('id_detalle_venta', idDetalle)
    )
  );
};


const getPromoProductBreakdown = async (idDetalleVenta, idProd, totalUnits) => {
  const { data: exclusionRows } = await supabase
    .from('detalles_venta_exclusiones_promo')
    .select('nom_ing, num_unidad')
    .eq('id_detalle_venta', idDetalleVenta)
    .eq('id_prod', idProd);

  const { data: extraRows } = await supabase
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

  const plainCount = totalUnits - customizedUnits.size;
  if (plainCount > 0) {
    groups.set('__plain__', { cantidad: plainCount, exclusiones: [], extras: [] });
  }

  return Array.from(groups.values());
};


export const buildPersonalizacion = async (det) => {
  if (det.id_prod) {
    const { data: exclusions } = await supabase.from('detalles_venta_exclusiones').select('nom_ing').eq('id_detalle_venta', det.id_detalle_venta);
    const { data: extras } = await supabase.from('detalles_venta_extras').select('nom_ing, cantidad_extra').eq('id_detalle_venta', det.id_detalle_venta);

    const exclText = (exclusions || []).length ? `sin: ${(exclusions || []).map((e) => e.nom_ing).join(', ')}` : '';
    const extraText = (extras || []).length ? `extra: ${(extras || []).map((e) => `+${e.cantidad_extra} ${e.nom_ing}`).join(', ')}` : '';
    return [exclText, extraText].filter(Boolean).join(' | ');
  }

  if (det.id_prom) {
    const { data: promProducts } = await supabase
      .from('promocion_prod')
      .select('id_prod, cantidad_prod_prom, producto:producto(nom_prod)')
      .eq('id_prom', det.id_prom);

    const partes = [];
    for (const pp of promProducts || []) {
      const totalUnits = pp.cantidad_prod_prom * det.cantidad_prod_det;
      const breakdown = await getPromoProductBreakdown(det.id_detalle_venta, pp.id_prod, totalUnits);
      const customizedGroups = breakdown.filter((g) => g.exclusiones.length || g.extras.length);

      for (const g of customizedGroups) {
        const bits = [];
        if (g.exclusiones.length) bits.push(`sin ${g.exclusiones.join(', ')}`);
        if (g.extras.length) bits.push(`extra ${g.extras.join(', ')}`);
        partes.push(`${pp.producto?.nom_prod} (${g.cantidad}x): ${bits.join(' | ')}`);
      }
    }
    return partes.join(' | ');
  }

  return '';
};

export const getOrderTicket = async (idVenta) => {
  const { data: venta } = await supabase
    .from('venta')
    .select('num_venta, fecha_reg, hora_reg, total_venta, id_mesa, id_seccion, cod_emp')
    .eq('id_venta', idVenta)
    .single();

  if (!venta) return null;

  const { data: mesero } = await supabase.from('empleado').select('alias_emp').eq('cod_emp', venta.cod_emp).maybeSingle();
  const { data: seccion } = await supabase.from('seccion').select('nomb_seccion').eq('id_seccion', venta.id_seccion).single();

  const { data: detalles } = await supabase
    .from('detalles_venta')
    .select('id_detalle_venta, cantidad_prod_det, tipo_consumo, subtotal, id_prod, id_prom, producto:producto(nom_prod, precio_venta), promocion:promocion(nom_prom, precio_prom)')
    .eq('id_venta', idVenta);

  const grouped = new Map();

  for (const det of detalles || []) {
    const nombre = det.producto?.nom_prod || det.promocion?.nom_prom;
    const precio = det.producto?.precio_venta ?? det.promocion?.precio_prom;
    const personalizacion = await buildPersonalizacion(det);

    const key = `${nombre}_${det.tipo_consumo}_${personalizacion}`;

    if (!grouped.has(key)) {
      grouped.set(key, { producto: nombre, tipo: det.tipo_consumo, precio: Number(precio), cantidad: 0, subtotal: 0, personalizacion });
    }

    const item = grouped.get(key);
    item.cantidad += det.cantidad_prod_det;
    item.subtotal += Number(det.subtotal);
  }

  return {
    numVenta: venta.num_venta,
    mesa: venta.id_mesa,
    seccion: seccion?.nomb_seccion,
    mesero: mesero?.alias_emp,
    total: venta.total_venta,
    items: Array.from(grouped.values())
  };
};

export const getKitchenTicket = async (idVenta, fecha) => {
  const { data: venta } = await supabase
    .from('venta')
    .select('num_venta, id_mesa, id_seccion, cod_emp')
    .eq('id_venta', idVenta)
    .single();

  if (!venta) return null;

  const { data: mesero } = await supabase.from('empleado').select('alias_emp').eq('cod_emp', venta.cod_emp).maybeSingle();
  const { data: seccion } = await supabase.from('seccion').select('nomb_seccion').eq('id_seccion', venta.id_seccion).single();

  const { data: detalles } = await supabase
    .from('detalles_venta')
    .select('id_detalle_venta, cantidad_prod_det, tipo_consumo, id_prod, id_prom, producto:producto(nom_prod)')
    .eq('id_venta', idVenta)
    .eq('fecha_reg_detalle_venta', fecha);

  const grouped = new Map();
  const addLine = (nombre, tipo, cantidad, personalizacion) => {
    const key = `${nombre}_${tipo}_${personalizacion}`;
    if (!grouped.has(key)) grouped.set(key, { producto: nombre, tipo, cantidad: 0, personalizacion });
    grouped.get(key).cantidad += cantidad;
  };

  for (const det of detalles || []) {
    if (det.id_prod) {
      const personalizacion = await buildPersonalizacion(det);
      addLine(det.producto?.nom_prod, det.tipo_consumo, det.cantidad_prod_det, personalizacion);
    } else if (det.id_prom) {
      const { data: promProducts } = await supabase
        .from('promocion_prod')
        .select('id_prod, cantidad_prod_prom, producto:producto(nom_prod)')
        .eq('id_prom', det.id_prom);

      for (const pp of promProducts || []) {
        const totalUnits = pp.cantidad_prod_prom * det.cantidad_prod_det;
        const breakdown = await getPromoProductBreakdown(det.id_detalle_venta, pp.id_prod, totalUnits);

        for (const g of breakdown) {
          const exclText = g.exclusiones.length ? `sin: ${g.exclusiones.join(', ')}` : '';
          const extraText = g.extras.length ? `extra: ${g.extras.join(', ')}` : '';
          const personalizacion = [exclText, extraText].filter(Boolean).join(' | ');
          addLine(pp.producto?.nom_prod, det.tipo_consumo, g.cantidad, personalizacion);
        }
      }
    }
  }

  return {
    numVenta: venta.num_venta,
    mesa: venta.id_mesa,
    seccion: seccion?.nomb_seccion,
    mesero: mesero?.alias_emp,
    items: Array.from(grouped.values())
  };
};

export const verifyOwnPassword = async (user, password) => {
  if (user.isDirectorio) {
    const { data } = await supabase.from('directorio').select('contrasena_admin').limit(1).maybeSingle();
    if (!data) return false;
    return verifyPassword(password, data.contrasena_admin);
  }

  const { data } = await supabase.from('empleado').select('cont_emp').eq('cod_emp', user.codEmp).maybeSingle();
  if (!data) return false;
  return verifyPassword(password, data.cont_emp);
};

export const getLatestVentaId = async (idMesa, idSeccion) => {
  const { data } = await supabase
    .from('venta')
    .select('id_venta')
    .eq('id_mesa', idMesa)
    .eq('id_seccion', idSeccion)
    .order('fecha_reg', { ascending: false })
    .limit(1)
    .single();

  return data?.id_venta;
};

export const countUnmarkedUnits = async (idMesa, idSeccion) => {
  const idVenta = await getLatestVentaId(idMesa, idSeccion);
  if (!idVenta) return 0;

  const { data: detalles } = await supabase.from('detalles_venta').select('id_detalle_venta').eq('id_venta', idVenta);
  const detalleIds = (detalles || []).map((d) => d.id_detalle_venta);
  if (detalleIds.length === 0) return 0;

  const { count } = await supabase
    .from('detalles_venta_unidades')
    .select('*', { count: 'exact', head: true })
    .in('id_detalle_venta', detalleIds)
    .eq('marcado', false);

  return count || 0;
};

const getMetodoPagoId = async (nombre) => {
  const { data } = await supabase.from('metodo_pago').select('id_metodo').ilike('nombre', nombre).maybeSingle();
  return data?.id_metodo;
};

export const checkoutOrder = async (idVenta, payment) => {
  const { data: venta } = await supabase
    .from('venta')
    .select('total_venta, id_mesa, id_seccion')
    .eq('id_venta', idVenta)
    .single();

  if (!venta) throw new Error('ORDER_NOT_FOUND');

  const unmarked = await countUnmarkedUnits(venta.id_mesa, venta.id_seccion);
  if (unmarked > 0) throw new Error(`UNMARKED_UNITS:${unmarked}`);

  const total = Number(venta.total_venta);
  const montoEfectivo = Number(payment.montoEfectivo || 0);
  const montoQr = Number(payment.montoQr || 0);

  if (payment.metodo === 'efectivo' && Math.abs(montoEfectivo - total) > 0.01) {
    throw new Error('AMOUNT_MISMATCH');
  }
  if (payment.metodo === 'qr' && Math.abs(montoQr - total) > 0.01) {
    throw new Error('AMOUNT_MISMATCH');
  }
  if (payment.metodo === 'mixto' && Math.abs(montoEfectivo + montoQr - total) > 0.01) {
    throw new Error('AMOUNT_MISMATCH');
  }

  const efectivoId = await getMetodoPagoId('Efectivo');
  const qrId = await getMetodoPagoId('Qr');

  if (payment.metodo === 'efectivo' || payment.metodo === 'mixto') {
    await supabase.from('pago').insert({ id_venta: idVenta, id_metodo: efectivoId, monto: montoEfectivo });
  }
  if (payment.metodo === 'qr' || payment.metodo === 'mixto') {
    await supabase.from('pago').insert({ id_venta: idVenta, id_metodo: qrId, monto: montoQr });
  }

  await supabase.from('detalles_venta').update({ estado_detalle_venta: 'Finalizado' }).eq('id_venta', idVenta);
  await supabase.from('mesa').update({ disponible: true }).eq('id_mesa', venta.id_mesa).eq('id_seccion', venta.id_seccion);
  await supabase.from('venta').update({ hora_cierre: new Date().toISOString() }).eq('id_venta', idVenta);
};


export const applyMarkChanges = async (markIds, unmarkIds) => {
  const allIds = [...markIds, ...unmarkIds];
  if (allIds.length === 0) return;
  if (markIds.length > 0) {
    await supabase.from('detalles_venta_unidades').update({ marcado: true }).in('id_unidad', markIds);
  }
  if (unmarkIds.length > 0) {
    await supabase.from('detalles_venta_unidades').update({ marcado: false }).in('id_unidad', unmarkIds);
  }
  const { data: units } = await supabase.from('detalles_venta_unidades').select('id_detalle_venta, marcado').in('id_unidad', allIds);
  const detalleIds = [...new Set((units || []).map((u) => u.id_detalle_venta))];
  const { data: allUnits } = await supabase
    .from('detalles_venta_unidades')
    .select('id_detalle_venta, marcado')
    .in('id_detalle_venta', detalleIds);
  const countsByDetalle = new Map();
  for (const unit of allUnits || []) {
    if (!unit.marcado) continue;
    countsByDetalle.set(unit.id_detalle_venta, (countsByDetalle.get(unit.id_detalle_venta) || 0) + 1);
  }
  await Promise.all(
    detalleIds.map((idDetalle) =>
      supabase.from('detalles_venta').update({ cantidad_marcado: countsByDetalle.get(idDetalle) || 0 }).eq('id_detalle_venta', idDetalle)
    )
  );
};