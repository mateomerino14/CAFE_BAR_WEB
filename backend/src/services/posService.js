import { query } from '../config/db.js';
import { verifyPassword } from '../utils/password.js';

/* Obtiene las secciones junto con las mesas existentes de cada una y sus estados de disponibilidad. */
export const listSectionsWithTables = async () => {
  const sectionsResult = await query(`SELECT id_seccion, nomb_seccion FROM seccion ORDER BY nomb_seccion`);
  const tablesResult = await query(`SELECT id_mesa, id_seccion, disponible FROM mesa WHERE existe = true ORDER BY id_mesa`);
  return sectionsResult.rows.map((section) => ({
    ...section,
    mesas: tablesResult.rows.filter((table) => table.id_seccion === section.id_seccion)
  }));
};

/*Obtiene la fecha actual correspondiente a Bolivia en formato YYYY-MM-DD.*/
const getBoliviaDateString = () => {
  const now = new Date();
  const bolivianShifted = new Date(now.getTime() - 4 * 60 * 60 * 1000);
  const year = bolivianShifted.getUTCFullYear();
  const month = String(bolivianShifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(bolivianShifted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/*Obtiene de forma segura el siguiente número correlativo de venta para la fecha actual mediante una función de la base de datos.*/
const reserveNextSaleNumber = async () => {
  const result = await query(`SELECT get_next_daily_sale_number($1) AS numero`, [getBoliviaDateString()]);
  return result.rows[0].numero;
};

/*Calcula una vista previa del siguiente número de venta contando las ventas registradas desde el inicio del día actual.*/
export const getNextSaleNumberPreview = async () => {
  const result = await query(
    `SELECT COUNT(*) FROM venta WHERE fecha_reg >= $1`,
    [`${getBoliviaDateString()}T04:00:00.000Z`]
  );
  return Number(result.rows[0].count) + 1;
};

/* Calcula la cantidad de ingredientes necesarios para los productos y promociones solicitados, considerando exclusiones, extras y personalizaciones. */
const buildStockRequirements = async (items) => {
  const neededByIngredient = new Map();
  const addNeed = (idIng, amount) => neededByIngredient.set(idIng, (neededByIngredient.get(idIng) || 0) + amount);

  for (const item of items) {
    if (item.type === 'product') {
      const exclusionIds = (item.exclusiones || []).map((e) => e.idIng);
      const ingredientsResult = await query(
        `SELECT id_ing, cantidad_ing_necesitada FROM productos_ingredientes WHERE id_prod = $1`,
        [item.idProd]
      );
      for (const row of ingredientsResult.rows) {
        if (exclusionIds.includes(row.id_ing)) continue;
        addNeed(row.id_ing, Number(row.cantidad_ing_necesitada) * item.cantidad);
      }
      for (const extra of item.extras || []) {
        addNeed(extra.idIng, Number(extra.cantidadExtra) * item.cantidad);
      }
    } else {
      const promProductsResult = await query(
        `SELECT id_prod, cantidad_prod_prom FROM promocion_prod WHERE id_prom = $1`,
        [item.idProm]
      );
      const customizationByProduct = new Map((item.productCustomizations || []).map((pc) => [pc.idProd, pc]));
      for (const pp of promProductsResult.rows) {
        const ingredientsResult = await query(
          `SELECT id_ing, cantidad_ing_necesitada FROM productos_ingredientes WHERE id_prod = $1`,
          [pp.id_prod]
        );
        const customization = customizationByProduct.get(pp.id_prod);
        if (!customization?.unitGroups?.length) {
          for (const row of ingredientsResult.rows) {
            addNeed(row.id_ing, Number(row.cantidad_ing_necesitada) * pp.cantidad_prod_prom * item.cantidad);
          }
          continue;
        }
        for (const group of customization.unitGroups) {
          const exclusionIds = (group.exclusiones || []).map((e) => e.idIng);
          for (const row of ingredientsResult.rows) {
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

/* Calcula los requerimientos de stock necesarios para los productos y promociones de una orden. */
export const computeStockRequirements = async (items) => buildStockRequirements(items);

/* Descuenta del stock la cantidad de ingredientes requerida por los productos y promociones procesados. */
export const deductStock = async (neededByIngredient) => {
  for (const [idIng, needed] of neededByIngredient) {
    const stockResult = await query(`SELECT cantidad_stock FROM stock WHERE id_ing = $1`, [idIng]);
    const newStock = Math.max(0, (Number(stockResult.rows[0]?.cantidad_stock) || 0) - needed);
    await query(`UPDATE stock SET cantidad_stock = $1 WHERE id_ing = $2`, [newStock, idIng]);
  }
};

/* Obtiene la venta existente de una mesa o crea una nueva cuando la mesa se encuentra disponible, asignando el mesero y cajero correspondientes. */
export const createOrGetVenta = async ({ idMesa, idSeccion, idMesero, idCajero }) => {
  const claimedResult = await query(
    `UPDATE mesa SET disponible = false WHERE id_mesa = $1 AND id_seccion = $2 AND disponible = true RETURNING id_mesa`,
    [idMesa, idSeccion]
  );

  if (claimedResult.rows[0]) {
    const numVenta = await reserveNextSaleNumber();
    const ventaResult = await query(
      `INSERT INTO venta (num_venta, cod_emp, cod_emp2, total_venta, id_mesa, id_seccion)
       VALUES ($1, $2, $3, 0, $4, $5) RETURNING id_venta, num_venta`,
      [numVenta, idMesero, idCajero, idMesa, idSeccion]
    );
    const venta = ventaResult.rows[0];
    return { idVenta: venta.id_venta, numVenta: venta.num_venta };
  }

  const ventaResult = await query(
    `SELECT id_venta, num_venta FROM venta WHERE id_mesa = $1 AND id_seccion = $2 ORDER BY fecha_reg DESC LIMIT 1`,
    [idMesa, idSeccion]
  );
  const venta = ventaResult.rows[0];
  return { idVenta: venta.id_venta, numVenta: venta.num_venta };
};

/* Crea los registros individuales de las unidades correspondientes a un producto dentro de un detalle de venta. */
const insertUnits = async (idDetalle, idProd, cantidad, startIndex = 0) => {
  for (let index = 0; index < cantidad; index++) {
    await query(
      `INSERT INTO detalles_venta_unidades (id_detalle_venta, num_unidad, marcado, id_prod) VALUES ($1, $2, false, $3)`,
      [idDetalle, startIndex + index, idProd]
    );
  }
};

/* Registra un producto individual en una venta, calculando su subtotal y almacenando sus unidades, exclusiones y extras personalizados. */
const insertProductItem = async (idVenta, idMesero, item, batchFecha) => {
  const productResult = await query(`SELECT precio_venta FROM producto WHERE id_prod = $1`, [item.idProd]);
  const product = productResult.rows[0];
  if (!product) throw new Error('PRODUCT_NOT_FOUND');

  const extraCost = (item.extras || []).reduce((sum, extra) => sum + Number(extra.precioExtra) * Number(extra.cantidadExtra), 0);
  const unitPrice = Number(product.precio_venta) + extraCost;
  const subtotal = unitPrice * item.cantidad;

  const detalleResult = await query(
    `INSERT INTO detalles_venta (id_venta, id_prod, subtotal, cantidad_prod_det, tipo_consumo, estado_detalle_venta, id_mesero_actual, fecha_reg_detalle_venta)
     VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', $6, $7) RETURNING id_detalle_venta`,
    [idVenta, item.idProd, subtotal, item.cantidad, item.tipoConsumo || 'Local', idMesero, batchFecha]
  );
  const detalle = detalleResult.rows[0];

  await insertUnits(detalle.id_detalle_venta, item.idProd, item.cantidad);

  if (item.exclusiones?.length) {
    for (const e of item.exclusiones) {
      await query(
        `INSERT INTO detalles_venta_exclusiones (id_detalle_venta, id_ing, nom_ing) VALUES ($1, $2, $3)`,
        [detalle.id_detalle_venta, e.idIng, e.nomIng]
      );
    }
  }
  if (item.extras?.length) {
    for (const e of item.extras) {
      await query(
        `INSERT INTO detalles_venta_extras (id_detalle_venta, id_ing, nom_ing, cantidad_extra, precio_extra) VALUES ($1, $2, $3, $4, $5)`,
        [detalle.id_detalle_venta, e.idIng, e.nomIng, e.cantidadExtra, e.precioExtra]
      );
    }
  }
  return subtotal;
};

/* Registra una promoción en una venta, incluyendo sus productos, unidades, exclusiones, extras y personalizaciones individuales. */
const insertPromotionItem = async (idVenta, idMesero, item, batchFecha) => {
  const promotionResult = await query(`SELECT precio_prom FROM promocion WHERE id_prom = $1`, [item.idProm]);
  const promotion = promotionResult.rows[0];
  if (!promotion) throw new Error('PROMOTION_NOT_FOUND');

  const customizationByProduct = new Map((item.productCustomizations || []).map((pc) => [pc.idProd, pc]));
  const extraCost = (item.productCustomizations || []).reduce((sum, pc) => {
    return sum + (pc.unitGroups || []).reduce((s, g) => {
      const groupExtraCost = (g.extras || []).reduce((es, e) => es + Number(e.precioExtra) * Number(e.cantidadExtra), 0);
      return s + groupExtraCost * g.cantidad;
    }, 0);
  }, 0);
  const subtotal = Number(promotion.precio_prom) * item.cantidad + extraCost;

  const detalleResult = await query(
    `INSERT INTO detalles_venta (id_venta, id_prom, subtotal, cantidad_prod_det, tipo_consumo, estado_detalle_venta, id_mesero_actual, fecha_reg_detalle_venta)
     VALUES ($1, $2, $3, $4, $5, 'PENDIENTE', $6, $7) RETURNING id_detalle_venta`,
    [idVenta, item.idProm, subtotal, item.cantidad, item.tipoConsumo || 'Local', idMesero, batchFecha]
  );
  const detalle = detalleResult.rows[0];

  const promProductsResult = await query(
    `SELECT id_prod, cantidad_prod_prom FROM promocion_prod WHERE id_prom = $1`,
    [item.idProm]
  );

  let globalUnitIndex = 0;
  for (const pp of promProductsResult.rows) {
    const totalUnits = pp.cantidad_prod_prom * item.cantidad;
    await insertUnits(detalle.id_detalle_venta, pp.id_prod, totalUnits, globalUnitIndex);

    const customization = customizationByProduct.get(pp.id_prod);
    if (customization?.unitGroups?.length) {
      let localUnitIndex = globalUnitIndex;
      for (const group of customization.unitGroups) {
        for (let i = 0; i < group.cantidad; i += 1) {
          const numUnidad = localUnitIndex + i;
          if (group.exclusiones?.length) {
            for (const e of group.exclusiones) {
              await query(
                `INSERT INTO detalles_venta_exclusiones_promo (id_detalle_venta, id_prod, id_ing, nom_ing, num_unidad) VALUES ($1, $2, $3, $4, $5)`,
                [detalle.id_detalle_venta, pp.id_prod, e.idIng, e.nomIng, numUnidad]
              );
            }
          }
          if (group.extras?.length) {
            for (const e of group.extras) {
              await query(
                `INSERT INTO detalles_venta_extras (id_detalle_venta, id_ing, nom_ing, cantidad_extra, precio_extra, id_prod, num_unidad)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [detalle.id_detalle_venta, e.idIng, e.nomIng, e.cantidadExtra, e.precioExtra, pp.id_prod, numUnidad]
              );
            }
          }
        }
        localUnitIndex += group.cantidad;
      }
    }
    globalUnitIndex += totalUnits;
  }
  return subtotal;
};

/* Agrega productos y promociones a una venta, actualiza el total acumulado y devuelve el nuevo total de la venta. */
export const addOrderItems = async (idVenta, idMesero, items, batchFecha) => {
  let totalAdded = 0;
  for (const item of items) {
    if (item.type === 'product') {
      totalAdded += await insertProductItem(idVenta, idMesero, item, batchFecha);
    } else {
      totalAdded += await insertPromotionItem(idVenta, idMesero, item, batchFecha);
    }
  }
  const ventaResult = await query(`SELECT total_venta FROM venta WHERE id_venta = $1`, [idVenta]);
  const newTotal = Number(ventaResult.rows[0].total_venta) + totalAdded;
  await query(`UPDATE venta SET total_venta = $1 WHERE id_venta = $2`, [newTotal, idVenta]);
  return newTotal;
};

/* Obtiene los detalles pendientes de la venta actual de una mesa y los agrupa por fecha de registro para identificar los pedidos que aún deben prepararse. */
export const listPendingBatches = async (idMesa, idSeccion) => {
  const ventaResult = await query(
    `SELECT id_venta FROM venta WHERE id_mesa = $1 AND id_seccion = $2 ORDER BY fecha_reg DESC LIMIT 1`,
    [idMesa, idSeccion]
  );
  const venta = ventaResult.rows[0];
  if (!venta) return [];

  const detallesResult = await query(
    `SELECT dv.id_detalle_venta, dv.fecha_reg_detalle_venta, dv.tipo_consumo, dv.id_prod, dv.id_prom, p.nom_prod, pr.nom_prom
     FROM detalles_venta dv
     LEFT JOIN producto p ON p.id_prod = dv.id_prod
     LEFT JOIN promocion pr ON pr.id_prom = dv.id_prom
     WHERE dv.id_venta = $1 AND dv.estado_detalle_venta = 'PENDIENTE'`,
    [venta.id_venta]
  );
  if (detallesResult.rows.length === 0) return [];

  const detalleIds = detallesResult.rows.map((d) => d.id_detalle_venta);
  const unitsResult = await query(
    `SELECT id_detalle_venta, marcado FROM detalles_venta_unidades WHERE id_detalle_venta = ANY($1::bigint[])`,
    [detalleIds]
  );

  const unitsByDetalle = new Map();
  for (const u of unitsResult.rows) {
    if (!unitsByDetalle.has(u.id_detalle_venta)) unitsByDetalle.set(u.id_detalle_venta, { total: 0, restante: 0 });
    const counts = unitsByDetalle.get(u.id_detalle_venta);
    counts.total += 1;
    if (!u.marcado) counts.restante += 1;
  }

  const batches = new Map();
  for (const row of detallesResult.rows) {
    const fechaValue = row.fecha_reg_detalle_venta instanceof Date ? row.fecha_reg_detalle_venta.toISOString() : row.fecha_reg_detalle_venta;
    const key = fechaValue;
    if (!batches.has(key)) batches.set(key, { fecha: fechaValue, items: [] });
    const counts = unitsByDetalle.get(row.id_detalle_venta) || { total: 0, restante: 0 };
    if (counts.restante <= 0) continue;
    batches.get(key).items.push({
      nombre: row.nom_prod || row.nom_prom,
      tipo: row.tipo_consumo,
      total: counts.total,
      restante: counts.restante
    });
  }

  return Array.from(batches.values())
    .filter((batch) => batch.items.length > 0)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
};

/* Obtiene los detalles de venta de una fecha específica y los agrupa por producto, tipo de consumo y personalización, separando las unidades pendientes de las ya marcadas. */
export const getMarkCards = async (fecha) => {
  const detallesResult = await query(
    `SELECT id_detalle_venta, tipo_consumo, id_prod, id_prom FROM detalles_venta WHERE fecha_reg_detalle_venta = $1`,
    [fecha]
  );
  if (detallesResult.rows.length === 0) return [];

  const detalles = detallesResult.rows;
  const detalleIds = detalles.map((d) => d.id_detalle_venta);
  const productDetalleIds = detalles.filter((d) => d.id_prod).map((d) => d.id_detalle_venta);
  const promoDetalleIds = detalles.filter((d) => d.id_prom).map((d) => d.id_detalle_venta);
  const productIds = [...new Set(detalles.filter((d) => d.id_prod).map((d) => d.id_prod))];
  const promoIds = [...new Set(detalles.filter((d) => d.id_prom).map((d) => d.id_prom))];

  const [unitsResult, exclusionsResult, extrasResult, exclusionsPromoResult, productosResult, promoProductsResult] = await Promise.all([
    query(`SELECT id_unidad, id_detalle_venta, id_prod, num_unidad, marcado FROM detalles_venta_unidades WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds]),
    productDetalleIds.length
      ? query(`SELECT id_detalle_venta, nom_ing FROM detalles_venta_exclusiones WHERE id_detalle_venta = ANY($1::bigint[])`, [productDetalleIds])
      : Promise.resolve({ rows: [] }),
    detalleIds.length
      ? query(`SELECT id_detalle_venta, id_prod, nom_ing, cantidad_extra, num_unidad FROM detalles_venta_extras WHERE id_detalle_venta = ANY($1::bigint[])`, [detalleIds])
      : Promise.resolve({ rows: [] }),
    promoDetalleIds.length
      ? query(`SELECT id_detalle_venta, id_prod, nom_ing, num_unidad FROM detalles_venta_exclusiones_promo WHERE id_detalle_venta = ANY($1::bigint[])`, [promoDetalleIds])
      : Promise.resolve({ rows: [] }),
    productIds.length
      ? query(`SELECT id_prod, nom_prod FROM producto WHERE id_prod = ANY($1::bigint[])`, [productIds])
      : Promise.resolve({ rows: [] }),
    promoIds.length
      ? query(`SELECT pp.id_prom, pp.id_prod, p.nom_prod FROM promocion_prod pp JOIN producto p ON p.id_prod = pp.id_prod WHERE pp.id_prom = ANY($1::bigint[])`, [promoIds])
      : Promise.resolve({ rows: [] })
  ]);

  const productNameById = new Map(productosResult.rows.map((p) => [p.id_prod, p.nom_prod]));
  const unitsByKey = new Map();
  for (const u of unitsResult.rows) {
    const key = `${u.id_detalle_venta}|${u.id_prod}`;
    if (!unitsByKey.has(key)) unitsByKey.set(key, []);
    unitsByKey.get(key).push(u);
  }
  const exclusionsByDetalle = new Map();
  for (const e of exclusionsResult.rows) {
    if (!exclusionsByDetalle.has(e.id_detalle_venta)) exclusionsByDetalle.set(e.id_detalle_venta, []);
    exclusionsByDetalle.get(e.id_detalle_venta).push(e.nom_ing);
  }
  const extrasByDetalleNoProd = new Map();
  for (const e of extrasResult.rows) {
    if (e.id_prod) continue;
    if (!extrasByDetalleNoProd.has(e.id_detalle_venta)) extrasByDetalleNoProd.set(e.id_detalle_venta, []);
    extrasByDetalleNoProd.get(e.id_detalle_venta).push(`+${e.cantidad_extra} ${e.nom_ing}`);
  }
  const exclusionsPromoByUnit = new Map();
  for (const e of exclusionsPromoResult.rows) {
    const key = `${e.id_detalle_venta}|${e.id_prod}|${e.num_unidad}`;
    if (!exclusionsPromoByUnit.has(key)) exclusionsPromoByUnit.set(key, []);
    exclusionsPromoByUnit.get(key).push(e.nom_ing);
  }
  const extrasPromoByUnit = new Map();
  for (const e of extrasResult.rows) {
    if (!e.id_prod || e.num_unidad === null || e.num_unidad === undefined) continue;
    const key = `${e.id_detalle_venta}|${e.id_prod}|${e.num_unidad}`;
    if (!extrasPromoByUnit.has(key)) extrasPromoByUnit.set(key, []);
    extrasPromoByUnit.get(key).push(`+${e.cantidad_extra} ${e.nom_ing}`);
  }
  const promoProductsByPromo = new Map();
  for (const pp of promoProductsResult.rows) {
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
        const nombre = pp.nom_prod;
        for (const unit of detUnits) {
          const unitKey = `${det.id_detalle_venta}|${pp.id_prod}|${unit.num_unidad}`;
          const exclusionNames = (exclusionsPromoByUnit.get(unitKey) || []).slice().sort();
          const extrasList = (extrasPromoByUnit.get(unitKey) || []).slice().sort();
          const key = `${nombre}|${det.tipo_consumo}|${exclusionNames.join(',')}|${extrasList.join(',')}`;
          if (!grupos.has(key)) {
            grupos.set(key, {
              nombre, tipo: det.tipo_consumo, exclusiones: exclusionNames,
              extrasTexto: extrasList.join(', '), pendientes: [], listos: []
            });
          }
          const grupo = grupos.get(key);
          if (unit.marcado) grupo.listos.push(unit.id_unidad);
          else grupo.pendientes.push(unit.id_unidad);
        }
      }
    }
  }
  return Array.from(grupos.values()).map((g) => ({ ...g, total: g.pendientes.length + g.listos.length })).filter((g) => g.pendientes.length > 0);
};

/* NOTA: sin usar por ningún componente del frontend todavía — reemplazada en la práctica por
   applyMarkChanges (marca/desmarca varias unidades de una vez, usada por Marcar Pendientes).
   Se deja disponible por si se necesita marcar una sola unidad puntual a futuro. */
/* Actualiza el estado marcado de las unidades indicadas y sincroniza la cantidad de unidades marcadas en cada detalle de venta afectado. */
export const markUnits = async (unitIds, marcado) => {
  await query(`UPDATE detalles_venta_unidades SET marcado = $1 WHERE id_unidad = ANY($2::bigint[])`, [marcado, unitIds]);

  const unitsResult = await query(`SELECT id_detalle_venta FROM detalles_venta_unidades WHERE id_unidad = ANY($1::bigint[])`, [unitIds]);
  const detalleIds = [...new Set(unitsResult.rows.map((u) => u.id_detalle_venta))];

  const allUnitsResult = await query(
    `SELECT id_detalle_venta, marcado FROM detalles_venta_unidades WHERE id_detalle_venta = ANY($1::bigint[])`,
    [detalleIds]
  );
  const countsByDetalle = new Map();
  for (const unit of allUnitsResult.rows) {
    if (!unit.marcado) continue;
    countsByDetalle.set(unit.id_detalle_venta, (countsByDetalle.get(unit.id_detalle_venta) || 0) + 1);
  }

  await Promise.all(
    detalleIds.map((idDetalle) =>
      query(`UPDATE detalles_venta SET cantidad_marcado = $1 WHERE id_detalle_venta = $2`, [countsByDetalle.get(idDetalle) || 0, idDetalle])
    )
  );
};

/* Obtiene y agrupa las exclusiones y extras aplicados a las unidades de un producto perteneciente a una promoción. */
const getPromoProductBreakdown = async (idDetalleVenta, idProd, totalUnits) => {
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
  const plainCount = totalUnits - customizedUnits.size;
  if (plainCount > 0) {
    groups.set('__plain__', { cantidad: plainCount, exclusiones: [], extras: [] });
  }
  return Array.from(groups.values());
};

/* Construye una descripción de las personalizaciones de un detalle de venta, considerando exclusiones y extras de productos individuales o promociones. */
export const buildPersonalizacion = async (det) => {
  if (det.id_prod) {
    const exclusionsResult = await query(`SELECT nom_ing FROM detalles_venta_exclusiones WHERE id_detalle_venta = $1`, [det.id_detalle_venta]);
    const extrasResult = await query(`SELECT nom_ing, cantidad_extra FROM detalles_venta_extras WHERE id_detalle_venta = $1`, [det.id_detalle_venta]);
    const exclText = exclusionsResult.rows.length ? `sin: ${exclusionsResult.rows.map((e) => e.nom_ing).join(', ')}` : '';
    const extraText = extrasResult.rows.length ? `extra: ${extrasResult.rows.map((e) => `+${e.cantidad_extra} ${e.nom_ing}`).join(', ')}` : '';
    return [exclText, extraText].filter(Boolean).join(' | ');
  }
  if (det.id_prom) {
    const promProductsResult = await query(
      `SELECT pp.id_prod, pp.cantidad_prod_prom, p.nom_prod
       FROM promocion_prod pp JOIN producto p ON p.id_prod = pp.id_prod
       WHERE pp.id_prom = $1`,
      [det.id_prom]
    );
    const partes = [];
    for (const pp of promProductsResult.rows) {
      const totalUnits = pp.cantidad_prod_prom * det.cantidad_prod_det;
      const breakdown = await getPromoProductBreakdown(det.id_detalle_venta, pp.id_prod, totalUnits);
      const customizedGroups = breakdown.filter((g) => g.exclusiones.length || g.extras.length);
      for (const g of customizedGroups) {
        const bits = [];
        if (g.exclusiones.length) bits.push(`sin ${g.exclusiones.join(', ')}`);
        if (g.extras.length) bits.push(`extra ${g.extras.join(', ')}`);
        partes.push(`${pp.nom_prod} (${g.cantidad}x): ${bits.join(' | ')}`);
      }
    }
    return partes.join(' | ');
  }
  return '';
};

/* Obtiene la información de una venta y construye los datos necesarios para generar el ticket del pedido, agrupando productos con la misma configuración. */
export const getOrderTicket = async (idVenta) => {
  const ventaResult = await query(
    `SELECT num_venta, fecha_reg, hora_reg, total_venta, id_mesa, id_seccion, cod_emp FROM venta WHERE id_venta = $1`,
    [idVenta]
  );
  const venta = ventaResult.rows[0];
  if (!venta) return null;

  const meseroResult = await query(`SELECT alias_emp FROM empleado WHERE cod_emp = $1`, [venta.cod_emp]);
  const seccionResult = await query(`SELECT nomb_seccion FROM seccion WHERE id_seccion = $1`, [venta.id_seccion]);
  const detallesResult = await query(
    `SELECT dv.id_detalle_venta, dv.cantidad_prod_det, dv.tipo_consumo, dv.subtotal, dv.id_prod, dv.id_prom,
            p.nom_prod, p.precio_venta AS prod_precio, pr.nom_prom, pr.precio_prom AS promo_precio
     FROM detalles_venta dv
     LEFT JOIN producto p ON p.id_prod = dv.id_prod
     LEFT JOIN promocion pr ON pr.id_prom = dv.id_prom
     WHERE dv.id_venta = $1`,
    [idVenta]
  );

  const grouped = new Map();
  for (const det of detallesResult.rows) {
    const nombre = det.nom_prod || det.nom_prom;
    const precio = det.prod_precio ?? det.promo_precio;
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
    seccion: seccionResult.rows[0]?.nomb_seccion,
    mesero: meseroResult.rows[0]?.alias_emp,
    total: venta.total_venta,
    items: Array.from(grouped.values())
  };
};

/* Obtiene la información de una venta y construye los datos necesarios para generar el ticket de cocina correspondiente a una fecha específica del pedido. */
export const getKitchenTicket = async (idVenta, fecha) => {
  const ventaResult = await query(
    `SELECT num_venta, id_mesa, id_seccion, cod_emp FROM venta WHERE id_venta = $1`,
    [idVenta]
  );
  const venta = ventaResult.rows[0];
  if (!venta) return null;

  const meseroResult = await query(`SELECT alias_emp FROM empleado WHERE cod_emp = $1`, [venta.cod_emp]);
  const seccionResult = await query(`SELECT nomb_seccion FROM seccion WHERE id_seccion = $1`, [venta.id_seccion]);
  const detallesResult = await query(
    `SELECT dv.id_detalle_venta, dv.cantidad_prod_det, dv.tipo_consumo, dv.id_prod, dv.id_prom, p.nom_prod
     FROM detalles_venta dv
     LEFT JOIN producto p ON p.id_prod = dv.id_prod
     WHERE dv.id_venta = $1 AND dv.fecha_reg_detalle_venta = $2`,
    [idVenta, fecha]
  );

  const grouped = new Map();
  const addLine = (nombre, tipo, cantidad, personalizacion) => {
    const key = `${nombre}_${tipo}_${personalizacion}`;
    if (!grouped.has(key)) {
      grouped.set(key, { producto: nombre, tipo, cantidad: 0, personalizacion });
    }
    grouped.get(key).cantidad += cantidad;
  };

  for (const det of detallesResult.rows) {
    if (det.id_prod) {
      const personalizacion = await buildPersonalizacion(det);
      addLine(det.nom_prod, det.tipo_consumo, det.cantidad_prod_det, personalizacion);
    } else if (det.id_prom) {
      const promProductsResult = await query(
        `SELECT pp.id_prod, pp.cantidad_prod_prom, p.nom_prod
         FROM promocion_prod pp JOIN producto p ON p.id_prod = pp.id_prod
         WHERE pp.id_prom = $1`,
        [det.id_prom]
      );
      for (const pp of promProductsResult.rows) {
        const totalUnits = pp.cantidad_prod_prom * det.cantidad_prod_det;
        const breakdown = await getPromoProductBreakdown(det.id_detalle_venta, pp.id_prod, totalUnits);
        for (const g of breakdown) {
          const exclText = g.exclusiones.length ? `sin: ${g.exclusiones.join(', ')}` : '';
          const extraText = g.extras.length ? `extra: ${g.extras.join(', ')}` : '';
          const personalizacion = [exclText, extraText].filter(Boolean).join(' | ');
          addLine(pp.nom_prod, det.tipo_consumo, g.cantidad, personalizacion);
        }
      }
    }
  }

  return {
    numVenta: venta.num_venta,
    mesa: venta.id_mesa,
    seccion: seccionResult.rows[0]?.nomb_seccion,
    mesero: meseroResult.rows[0]?.alias_emp,
    items: Array.from(grouped.values())
  };
};

/* Verifica la contraseña del usuario actual consultando las credenciales correspondientes según se trate de un usuario directorio o empleado. */
export const verifyOwnPassword = async (user, password) => {
  if (user.isDirectorio) {
    const result = await query(`SELECT contrasena_admin FROM directorio LIMIT 1`);
    const data = result.rows[0];
    if (!data) return false;
    return verifyPassword(password, data.contrasena_admin);
  }
  const result = await query(`SELECT cont_emp FROM empleado WHERE cod_emp = $1`, [user.codEmp]);
  const data = result.rows[0];
  if (!data) return false;
  return verifyPassword(password, data.cont_emp);
};

/* Obtiene el identificador de la venta más reciente asociada a una mesa y sección determinadas. */
export const getLatestVentaId = async (idMesa, idSeccion) => {
  const result = await query(
    `SELECT id_venta FROM venta WHERE id_mesa = $1 AND id_seccion = $2 ORDER BY fecha_reg DESC LIMIT 1`,
    [idMesa, idSeccion]
  );
  return result.rows[0]?.id_venta;
};

/* Cuenta las unidades de la venta más reciente de una mesa que todavía no han sido marcadas como preparadas. */
export const countUnmarkedUnits = async (idMesa, idSeccion) => {
  const idVenta = await getLatestVentaId(idMesa, idSeccion);
  if (!idVenta) return 0;

  const detallesResult = await query(`SELECT id_detalle_venta FROM detalles_venta WHERE id_venta = $1`, [idVenta]);
  const detalleIds = detallesResult.rows.map((d) => d.id_detalle_venta);
  if (detalleIds.length === 0) return 0;

  const result = await query(
    `SELECT COUNT(*) FROM detalles_venta_unidades WHERE id_detalle_venta = ANY($1::bigint[]) AND marcado = false`,
    [detalleIds]
  );
  return Number(result.rows[0].count) || 0;
};

/* Obtiene el identificador del método de pago cuyo nombre coincide con el proporcionado. */
const getMetodoPagoId = async (nombre) => {
  const result = await query(`SELECT id_metodo FROM metodo_pago WHERE nombre ILIKE $1 LIMIT 1`, [nombre]);
  return result.rows[0]?.id_metodo;
};

/* Valida el estado de la orden y los montos recibidos, registra los pagos, finaliza los detalles, libera la mesa y registra la hora de cierre de la venta. */
export const checkoutOrder = async (idVenta, payment) => {
  const ventaResult = await query(`SELECT total_venta, id_mesa, id_seccion FROM venta WHERE id_venta = $1`, [idVenta]);
  const venta = ventaResult.rows[0];
  if (!venta) throw new Error('ORDER_NOT_FOUND');

  const unmarked = await countUnmarkedUnits(venta.id_mesa, venta.id_seccion);
  if (unmarked > 0) throw new Error(`UNMARKED_UNITS:${unmarked}`);

  const total = Number(venta.total_venta);
  const montoEfectivo = Number(payment.montoEfectivo || 0);
  const montoQr = Number(payment.montoQr || 0);

  if (payment.metodo === 'efectivo' && Math.abs(montoEfectivo - total) > 0.001) throw new Error('AMOUNT_MISMATCH');
  if (payment.metodo === 'qr' && Math.abs(montoQr - total) > 0.001) throw new Error('AMOUNT_MISMATCH');
  if (payment.metodo === 'mixto' && Math.abs(montoEfectivo + montoQr - total) > 0.001) throw new Error('AMOUNT_MISMATCH');

  const efectivoId = await getMetodoPagoId('Efectivo');
  const qrId = await getMetodoPagoId('Qr');

  if (payment.metodo === 'efectivo' || payment.metodo === 'mixto') {
    await query(`INSERT INTO pago (id_venta, id_metodo, monto) VALUES ($1, $2, $3)`, [idVenta, efectivoId, montoEfectivo]);
  }
  if (payment.metodo === 'qr' || payment.metodo === 'mixto') {
    await query(`INSERT INTO pago (id_venta, id_metodo, monto) VALUES ($1, $2, $3)`, [idVenta, qrId, montoQr]);
  }

  await query(`UPDATE detalles_venta SET estado_detalle_venta = 'Finalizado' WHERE id_venta = $1`, [idVenta]);
  await query(`UPDATE mesa SET disponible = true WHERE id_mesa = $1 AND id_seccion = $2`, [venta.id_mesa, venta.id_seccion]);
  await query(`UPDATE venta SET hora_cierre = $1 WHERE id_venta = $2`, [new Date().toISOString(), idVenta]);
};

/* Aplica simultáneamente los cambios de unidades marcadas y desmarcadas y actualiza la cantidad total de unidades marcadas en cada detalle afectado. */
export const applyMarkChanges = async (markIds, unmarkIds) => {
  const allIds = [...markIds, ...unmarkIds];
  if (allIds.length === 0) return;

  if (markIds.length > 0) {
    await query(`UPDATE detalles_venta_unidades SET marcado = true WHERE id_unidad = ANY($1::bigint[])`, [markIds]);
  }
  if (unmarkIds.length > 0) {
    await query(`UPDATE detalles_venta_unidades SET marcado = false WHERE id_unidad = ANY($1::bigint[])`, [unmarkIds]);
  }

  const unitsResult = await query(`SELECT id_detalle_venta, marcado FROM detalles_venta_unidades WHERE id_unidad = ANY($1::bigint[])`, [allIds]);
  const detalleIds = [...new Set(unitsResult.rows.map((u) => u.id_detalle_venta))];

  const allUnitsResult = await query(
    `SELECT id_detalle_venta, marcado FROM detalles_venta_unidades WHERE id_detalle_venta = ANY($1::bigint[])`,
    [detalleIds]
  );
  const countsByDetalle = new Map();
  for (const unit of allUnitsResult.rows) {
    if (!unit.marcado) continue;
    countsByDetalle.set(unit.id_detalle_venta, (countsByDetalle.get(unit.id_detalle_venta) || 0) + 1);
  }

  await Promise.all(
    detalleIds.map((idDetalle) =>
      query(`UPDATE detalles_venta SET cantidad_marcado = $1 WHERE id_detalle_venta = $2`, [countsByDetalle.get(idDetalle) || 0, idDetalle])
    )
  );
};
