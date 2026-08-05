import { supabase } from '../config/supabaseClient.js';
import { uploadPhoto } from '../utils/storage.js';

const isPromotionNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('promocion').select('id_prom').ilike('nom_prom', name);
  if (excludeId) query = query.neq('id_prom', excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

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

const insertPromotionProducts = async (idProm, products) => {
  if (products.length === 0) return;
  const rows = products.map((item) => ({ id_prom: idProm, id_prod: item.idProd, cantidad_prod_prom: item.cantidad }));
  const { error } = await supabase.from('promocion_prod').insert(rows);
  if (error) throw error;
};

const insertPromotionDays = async (idProm, days) => {
  if (!days || days.length === 0) return;
  const rows = days.map((dia) => ({ id_prom: idProm, dia_semana: dia }));
  const { error } = await supabase.from('promocion_dias').insert(rows);
  if (error) throw error;
};

export const createPromotion = async (fields, imageFile, products, schedule, days) => {
  const nameTaken = await isPromotionNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_PROMOTION');
  const imageUrl = imageFile ? await uploadPhoto('promotions', imageFile) : null;
  const scheduleColumns = buildScheduleColumns(schedule);
  const { data: promotion, error } = await supabase
    .from('promocion')
    .insert({ nom_prom: fields.nombre, precio_prom: fields.precioProm, img_prom: imageUrl, ...scheduleColumns })
    .select('id_prom')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PROMOTION');
    throw error;
  }
  await insertPromotionProducts(promotion.id_prom, products);
  if (schedule.scheduleType === 'recurring' || (schedule.scheduleType === 'range' && schedule.daysEnabled)) {
    await insertPromotionDays(promotion.id_prom, days);
  }
  return promotion.id_prom;
};

export const listPromotionNames = async () => {
  const { data } = await supabase.from('promocion').select('nom_prom').eq('activo', true).order('nom_prom');
  return (data || []).map((row) => row.nom_prom);
};

export const listAllPromotionNames = async () => {
  const { data } = await supabase.from('promocion').select('nom_prom').order('nom_prom');
  return (data || []).map((row) => row.nom_prom);
};

export const listPromotions = async (search) => {
  let query = supabase.from('promocion').select('id_prom, nom_prom, precio_prom, img_prom').eq('activo', true).order('nom_prom');
  if (search) query = query.ilike('nom_prom', `${search}%`);
  const { data } = await query;
  return data || [];
};

export const listAllPromotionsStatus = async (search) => {
  let query = supabase.from('promocion').select('id_prom, nom_prom, precio_prom, img_prom, activo').order('nom_prom');
  if (search) query = query.ilike('nom_prom', `${search}%`);
  const { data } = await query;
  return data || [];
};

export const getPromotionDetail = async (idProm) => {
  const { data: promotion } = await supabase
    .from('promocion')
    .select('id_prom, nom_prom, precio_prom, img_prom, fecha_especifica, fecha_inicio, fecha_fin, hora_inicio, hora_fin')
    .eq('id_prom', idProm)
    .single();
  const { data: days } = await supabase.from('promocion_dias').select('dia_semana').eq('id_prom', idProm);
  const { data: products } = await supabase
    .from('promocion_prod')
    .select('id_prod, cantidad_prod_prom, producto:producto(nom_prod, precio_venta)')
    .eq('id_prom', idProm);
  return { promotion, days: (days || []).map((row) => row.dia_semana), products: products || [] };
};

export const updatePromotion = async (idProm, fields, imageFile, products, schedule, days) => {
  const nameTaken = await isPromotionNameTaken(fields.nombre, idProm);
  if (nameTaken) throw new Error('DUPLICATE_PROMOTION');
  const scheduleColumns = buildScheduleColumns(schedule);
  const updatePayload = { nom_prom: fields.nombre, precio_prom: fields.precioProm, ...scheduleColumns };
  if (imageFile) updatePayload.img_prom = await uploadPhoto('promotions', imageFile);
  const { error } = await supabase.from('promocion').update(updatePayload).eq('id_prom', idProm);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PROMOTION');
    throw error;
  }
  await supabase.from('promocion_dias').delete().eq('id_prom', idProm);
  if (schedule.scheduleType === 'recurring' || (schedule.scheduleType === 'range' && schedule.daysEnabled)) {
    await insertPromotionDays(idProm, days);
  }
  await supabase.from('promocion_prod').delete().eq('id_prom', idProm);
  await insertPromotionProducts(idProm, products);
};

export const setPromotionAvailability = async (idProm, available) => {
  const { error } = await supabase.from('promocion').update({ activo: available }).eq('id_prom', idProm);
  if (error) throw error;
};

export const getPromotionProductsWithIngredients = async (idProm) => {
  const { data: promProducts } = await supabase
    .from('promocion_prod')
    .select('id_prod, cantidad_prod_prom, producto:producto(nom_prod)')
    .eq('id_prom', idProm);
  const result = [];
  for (const pp of promProducts || []) {
    const { data: ingredients } = await supabase
      .from('productos_ingredientes')
      .select('id_ing, cantidad_ing_necesitada, stock:stock(nom_ing, precio_extra)')
      .eq('id_prod', pp.id_prod);
    result.push({
      idProd: pp.id_prod,
      nombre: pp.producto?.nom_prod,
      cantidadPromo: pp.cantidad_prod_prom,
      ingredients: (ingredients || []).map((row) => ({ id_ing: row.id_ing, nom_ing: row.stock?.nom_ing, precio_extra: row.stock?.precio_extra }))
    });
  }
  return result;
};


export const listActivePromotionsNow = async () => {
  const { data: promotions } = await supabase
    .from('promocion')
    .select('id_prom, nom_prom, precio_prom, img_prom, fecha_especifica, fecha_inicio, fecha_fin, hora_inicio, hora_fin')
    .eq('activo', true)
    .order('nom_prom');
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const jsDay = now.getDay();
  const ourDay = (jsDay + 6) % 7;
  const result = [];
  for (const promo of promotions || []) {
    if (promo.fecha_especifica) {
      if (promo.fecha_especifica !== today) continue;
    } else if (promo.fecha_inicio && promo.fecha_fin) {
      if (today < promo.fecha_inicio || today > promo.fecha_fin) continue;
    }
    const { data: days } = await supabase.from('promocion_dias').select('dia_semana').eq('id_prom', promo.id_prom);
    if ((days || []).length > 0) {
      const matches = days.some((d) => d.dia_semana === ourDay);
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