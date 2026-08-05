import { supabase } from '../config/supabaseClient.js';

export const listStockOptions = async () => {
  const { data } = await supabase
    .from('stock')
    .select('id_ing, nom_ing, descripcion, unidad_medida')
    .eq('disponible', true)
    .order('nom_ing');

  return data || [];
};

const isStockNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('stock').select('id_ing').ilike('nom_ing', name);
  if (excludeId) query = query.neq('id_ing', excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

export const createStock = async (fields) => {
  const nameTaken = await isStockNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_STOCK');
  const { error } = await supabase.from('stock').insert({
    nom_ing: fields.nombre,
    descripcion: fields.descripcion || null,
    cantidad_stock: fields.cantidadStock,
    unidad_medida: fields.unidadMedida,
    precio_extra: fields.precioExtra || 0
  });
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_STOCK');
    throw error;
  }
};

export const listStockNames = async () => {
  const { data } = await supabase.from('stock').select('nom_ing').order('nom_ing');
  return (data || []).map((row) => row.nom_ing);
};

export const listStock = async (search) => {
  let query = supabase
    .from('stock')
    .select('id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra')
    .order('nom_ing');
  if (search) query = query.ilike('nom_ing', `${search}%`);
  const { data } = await query;
  return data || [];
};

export const getStock = async (idIng) => {
  const { data } = await supabase
    .from('stock')
    .select('id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra')
    .eq('id_ing', idIng)
    .single();
  return data;
};

export const updateStock = async (idIng, fields) => {
  const nameTaken = await isStockNameTaken(fields.nombre, idIng);
  if (nameTaken) throw new Error('DUPLICATE_STOCK');
  const { error } = await supabase
    .from('stock')
    .update({
      nom_ing: fields.nombre,
      descripcion: fields.descripcion || null,
      cantidad_stock: fields.cantidadStock,
      unidad_medida: fields.unidadMedida,
      precio_extra: fields.precioExtra || 0
    })
    .eq('id_ing', idIng);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_STOCK');
    throw error;
  }
};