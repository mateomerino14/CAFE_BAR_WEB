import { query } from '../config/db.js';
import { uploadPhoto } from '../utils/storage.js';

/*Verifica si ya existe una promoción con el mismo nombre, permitiendo excluir una promoción específica al editar.*/
const isPromotionNameTaken = async (name, excludeId = null) => {
  const result = excludeId
    ? await query(`SELECT id_prom FROM promocion WHERE nom_prom ILIKE $1 AND id_prom != $2 LIMIT 1`, [name, excludeId])
    : await query(`SELECT id_prom FROM promocion WHERE nom_prom ILIKE $1 LIMIT 1`, [name]);
  return Boolean(result.rows[0]);
};

/*Construye las columnas de programación de una promoción según el tipo de horario seleccionado.*/
const buildScheduleColumns = (schedule) => {
  const { scheduleType, fechaEspecifica, fechaInicio, fechaFin, horaInicio, horaFin } = schedule;
  if (scheduleType === 'specific') {
    return { fecha_especifica: fechaEspecifica, fecha_inicio: null, fecha_fin: null, hora_inicio: horaInicio, hora_fin: horaFin };
  }
  if (scheduleType === 'range') {
    return { fecha_especifica: null, fecha_inicio: fechaInicio, fecha_fin: fechaFin, hora_inicio: horaInicio, hora_fin: horaFin };
  }
  if (scheduleType === 'recurring') {
    return { fecha_especifica: null, fecha_inicio: null, fecha_fin: null, hora_inicio: horaInicio, hora_fin: horaFin };
  }
  return { fecha_especifica: null, fecha_inicio: null, fecha_fin: null, hora_inicio: '00:00:00', hora_fin: '23:59:59' };
};

/*Inserta los productos asociados a una promoción junto con la cantidad de cada producto.*/
const insertPromotionProducts = async (idProm, products) => {
  for (const item of products) {
    await query(
      `INSERT INTO promocion_prod (id_prom, id_prod, cantidad_prod_prom) VALUES ($1, $2, $3)`,
      [idProm, item.idProd, item.cantidad]
    );
  }
};

/*Inserta los días de la semana asociados a una promoción.*/
const insertPromotionDays = async (idProm, days) => {
  if (!days || days.length === 0) return;
  for (const dia of days) {
    await query(`INSERT INTO promocion_dias (id_prom, dia_semana) VALUES ($1, $2)`, [idProm, dia]);
  }
};

/*Crea una nueva promoción, incluyendo su imagen, programación, productos y días configurados.*/
export const createPromotion = async (fields, imageFile, products, schedule, days) => {
  const nameTaken = await isPromotionNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_PROMOTION');
  const imageUrl = imageFile ? await uploadPhoto('promotions', imageFile) : null;
  const s = buildScheduleColumns(schedule);

  let promotion;
  try {
    const result = await query(
      `INSERT INTO promocion (nom_prom, precio_prom, img_prom, fecha_especifica, fecha_inicio, fecha_fin, hora_inicio, hora_fin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_prom`,
      [fields.nombre, fields.precioProm, imageUrl, s.fecha_especifica, s.fecha_inicio, s.fecha_fin, s.hora_inicio, s.hora_fin]
    );
    promotion = result.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PROMOTION');
    throw error;
  }

  await insertPromotionProducts(promotion.id_prom, products);
  if (schedule.scheduleType === 'recurring' || (schedule.scheduleType === 'range' && schedule.daysEnabled)) {
    await insertPromotionDays(promotion.id_prom, days);
  }
  return promotion.id_prom;
};

/*Obtiene los nombres de las promociones activas ordenados alfabéticamente.*/
export const listPromotionNames = async () => {
  const result = await query(`SELECT nom_prom FROM promocion WHERE activo = true ORDER BY nom_prom`);
  return result.rows.map((row) => row.nom_prom);
};

/*Obtiene los nombres de todas las promociones, independientemente de su estado de disponibilidad.*/
export const listAllPromotionNames = async () => {
  const result = await query(`SELECT nom_prom FROM promocion ORDER BY nom_prom`);
  return result.rows.map((row) => row.nom_prom);
};

/*Obtiene las promociones activas y sus datos principales, permitiendo filtrar por el inicio del nombre.*/
export const listPromotions = async (search) => {
  const result = search
    ? await query(`SELECT id_prom, nom_prom, precio_prom, img_prom FROM promocion WHERE activo = true AND nom_prom ILIKE $1 ORDER BY nom_prom`, [`${search}%`])
    : await query(`SELECT id_prom, nom_prom, precio_prom, img_prom FROM promocion WHERE activo = true ORDER BY nom_prom`);
  return result.rows;
};

/*Obtiene todas las promociones junto con su estado de disponibilidad, permitiendo filtrar por el inicio del nombre.*/
export const listAllPromotionsStatus = async (search) => {
  const result = search
    ? await query(`SELECT id_prom, nom_prom, precio_prom, img_prom, activo FROM promocion WHERE nom_prom ILIKE $1 ORDER BY nom_prom`, [`${search}%`])
    : await query(`SELECT id_prom, nom_prom, precio_prom, img_prom, activo FROM promocion ORDER BY nom_prom`);
  return result.rows;
};

/*Obtiene el detalle completo de una promoción, incluyendo su programación, días y productos asociados.*/
export const getPromotionDetail = async (idProm) => {
  const promotionResult = await query(
    `SELECT id_prom, nom_prom, precio_prom, img_prom, fecha_especifica, fecha_inicio, fecha_fin, hora_inicio, hora_fin
     FROM promocion WHERE id_prom = $1`,
    [idProm]
  );
  const daysResult = await query(`SELECT dia_semana FROM promocion_dias WHERE id_prom = $1`, [idProm]);
  const productsResult = await query(
    `SELECT pp.id_prod, pp.cantidad_prod_prom, p.nom_prod, p.precio_venta
     FROM promocion_prod pp
     JOIN producto p ON p.id_prod = pp.id_prod
     WHERE pp.id_prom = $1`,
    [idProm]
  );

  const promotionRow = promotionResult.rows[0];
  const toDateString = (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value);
  const promotion = promotionRow ? {
    ...promotionRow,
    fecha_especifica: toDateString(promotionRow.fecha_especifica),
    fecha_inicio: toDateString(promotionRow.fecha_inicio),
    fecha_fin: toDateString(promotionRow.fecha_fin)
  } : null;

  return {
    promotion,
    days: daysResult.rows.map((row) => row.dia_semana),
    products: productsResult.rows.map((row) => ({
      id_prod: row.id_prod,
      cantidad_prod_prom: row.cantidad_prod_prom,
      producto: { nom_prod: row.nom_prod, precio_venta: row.precio_venta }
    }))
  };
};

/*Actualiza los datos de una promoción y reemplaza su imagen, productos y días asociados cuando corresponde.*/
export const updatePromotion = async (idProm, fields, imageFile, products, schedule, days) => {
  const nameTaken = await isPromotionNameTaken(fields.nombre, idProm);
  if (nameTaken) throw new Error('DUPLICATE_PROMOTION');
  const s = buildScheduleColumns(schedule);

  try {
    if (imageFile) {
      const imagenUrl = await uploadPhoto('promotions', imageFile);
      await query(
        `UPDATE promocion SET nom_prom = $1, precio_prom = $2, fecha_especifica = $3, fecha_inicio = $4, fecha_fin = $5,
         hora_inicio = $6, hora_fin = $7, img_prom = $8 WHERE id_prom = $9`,
        [fields.nombre, fields.precioProm, s.fecha_especifica, s.fecha_inicio, s.fecha_fin, s.hora_inicio, s.hora_fin, imagenUrl, idProm]
      );
    } else {
      await query(
        `UPDATE promocion SET nom_prom = $1, precio_prom = $2, fecha_especifica = $3, fecha_inicio = $4, fecha_fin = $5,
         hora_inicio = $6, hora_fin = $7 WHERE id_prom = $8`,
        [fields.nombre, fields.precioProm, s.fecha_especifica, s.fecha_inicio, s.fecha_fin, s.hora_inicio, s.hora_fin, idProm]
      );
    }
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PROMOTION');
    throw error;
  }

  await query(`DELETE FROM promocion_dias WHERE id_prom = $1`, [idProm]);
  if (schedule.scheduleType === 'recurring' || (schedule.scheduleType === 'range' && schedule.daysEnabled)) {
    await insertPromotionDays(idProm, days);
  }
  await query(`DELETE FROM promocion_prod WHERE id_prom = $1`, [idProm]);
  await insertPromotionProducts(idProm, products);
};

/*Activa o desactiva la disponibilidad de una promoción.*/
export const setPromotionAvailability = async (idProm, available) => {
  await query(`UPDATE promocion SET activo = $1 WHERE id_prom = $2`, [available, idProm]);
};

/*Obtiene los productos de una promoción junto con sus ingredientes y cantidades necesarias para prepararlos.*/
export const getPromotionProductsWithIngredients = async (idProm) => {
  const promProductsResult = await query(
    `SELECT pp.id_prod, pp.cantidad_prod_prom, p.nom_prod
     FROM promocion_prod pp
     JOIN producto p ON p.id_prod = pp.id_prod
     WHERE pp.id_prom = $1`,
    [idProm]
  );

  const result = [];
  for (const pp of promProductsResult.rows) {
    const ingredientsResult = await query(
      `SELECT pi.id_ing, pi.cantidad_ing_necesitada, s.nom_ing, s.precio_extra
       FROM productos_ingredientes pi
       JOIN stock s ON s.id_ing = pi.id_ing
       WHERE pi.id_prod = $1`,
      [pp.id_prod]
    );
    result.push({
      idProd: pp.id_prod,
      nombre: pp.nom_prod,
      cantidadPromo: pp.cantidad_prod_prom,
      ingredients: ingredientsResult.rows.map((row) => ({ id_ing: row.id_ing, nom_ing: row.nom_ing, precio_extra: row.precio_extra }))
    });
  }
  return result;
};

/*Obtiene las promociones activas que se encuentran vigentes según la fecha, día de la semana y horario actual.*/
export const listActivePromotionsNow = async () => {
  const promotionsResult = await query(
    `SELECT id_prom, nom_prom, precio_prom, img_prom, fecha_especifica, fecha_inicio, fecha_fin, hora_inicio, hora_fin
     FROM promocion WHERE activo = true ORDER BY nom_prom`
  );

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const jsDay = now.getDay();
  const ourDay = (jsDay + 6) % 7;

  const result = [];
  for (const promo of promotionsResult.rows) {
    if (promo.fecha_especifica) {
      const fechaEsp = promo.fecha_especifica.toISOString ? promo.fecha_especifica.toISOString().slice(0, 10) : promo.fecha_especifica;
      if (fechaEsp !== today) continue;
    } else if (promo.fecha_inicio && promo.fecha_fin) {
      const fInicio = promo.fecha_inicio.toISOString ? promo.fecha_inicio.toISOString().slice(0, 10) : promo.fecha_inicio;
      const fFin = promo.fecha_fin.toISOString ? promo.fecha_fin.toISOString().slice(0, 10) : promo.fecha_fin;
      if (today < fInicio || today > fFin) continue;
    }

    const daysResult = await query(`SELECT dia_semana FROM promocion_dias WHERE id_prom = $1`, [promo.id_prom]);
    if (daysResult.rows.length > 0) {
      const matches = daysResult.rows.some((d) => d.dia_semana === ourDay);
      if (!matches) continue;
    }

    if (promo.hora_inicio && promo.hora_fin) {
      const [startH, startM] = promo.hora_inicio.split(':').map(Number);
      const [endH, endM] = promo.hora_fin.split(':').map(Number);
      const start = startH * 60 + startM;
      const end = endH * 60 + endM;
      if (currentMinutes < start || currentMinutes > end) continue;
    }

    result.push({ id_prom: promo.id_prom, nom_prom: promo.nom_prom, precio_prom: promo.precio_prom, img_prom: promo.img_prom });
  }
  return result;
};
