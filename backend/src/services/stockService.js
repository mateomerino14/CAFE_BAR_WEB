import {supabase} from '../config/supabaseClient.js';


/*Obtiene las opciones de stock disponibles, incluyendo sus datos básicos y unidad de medida.*/
export const listStockOptions = async () => {
  const {data} = await supabase
    .from('stock')
    .select('id_ing, nom_ing, descripcion, unidad_medida')
    .eq('disponible', true)
    .order('nom_ing');
  return data || [];
};


/*Verifica si ya existe un ingrediente con el mismo nombre, permitiendo excluir un registro específico al editar.*/
const isStockNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('stock').select('id_ing').ilike('nom_ing', name);
  if (excludeId) query = query.neq('id_ing', excludeId);
  const {data} = await query.maybeSingle();
  return Boolean(data);
};


/*Crea un nuevo registro de stock con sus datos, cantidad disponible, unidad de medida y precio adicional.*/
export const createStock = async (fields) => {
  const nameTaken = await isStockNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_STOCK');
  const {error} = await supabase.from('stock').insert({
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


/*Obtiene los nombres de todos los registros de stock ordenados alfabéticamente.*/
export const listStockNames = async () => {
  const {data} = await supabase.from('stock').select('nom_ing').order('nom_ing');
  return (data || []).map((row) => row.nom_ing);
};


/*Obtiene los registros de stock con sus datos principales, permitiendo filtrar por el inicio del nombre.*/
export const listStock = async (search) => {
  let query = supabase
    .from('stock')
    .select('id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra')
    .order('nom_ing');
  if (search) query = query.ilike('nom_ing', `${search}%`);
  const {data} = await query;
  return data || [];
};


/*Obtiene la información completa de un registro de stock mediante su identificador.*/
export const getStock = async (idIng) => {
  const {data} = await supabase
    .from('stock')
    .select('id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra')
    .eq('id_ing', idIng)
    .single();
  return data;
};


/*Actualiza los datos de un registro de stock, validando que no exista otro ingrediente con el mismo nombre.*/
export const updateStock = async (idIng, fields) => {
  const nameTaken = await isStockNameTaken(fields.nombre, idIng);
  if (nameTaken) throw new Error('DUPLICATE_STOCK');
  const {error} = await supabase
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