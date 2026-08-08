import {supabase} from '../config/supabaseClient.js';
import {uploadPhoto} from '../utils/storage.js';

/*Verifica si una categoría ya existe para evitar registros duplicados, permitiendo excluir un registro específico durante una modificación.*/
const isCategoryNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('categoria').select('id_categoria').ilike('nombre_categoria', name);
  if (excludeId) query = query.neq('id_categoria', excludeId);
  const {data} = await query.maybeSingle();
  return Boolean(data);
};

/*Verifica si una subcategoría ya existe dentro de una categoría determinada, evitando nombres duplicados y permitiendo excluir el registro actual al editar.*/
const isSubcategoryNameTaken = async (idCategoria, name, excludeId = null) => {
  let query = supabase.from('subcategoria').select('id_subcategoria').eq('id_categoria', idCategoria).ilike('nombre', name);
  if (excludeId) query = query.neq('id_subcategoria', excludeId);
  const {data} = await query.maybeSingle();
  return Boolean(data);
};

/* Registra una nueva categoría junto con sus subcategorías asociadas, validando duplicados y almacenando imágenes cuando corresponda. */
export const createCategoryWithSubcategories = async (nombreCategoria, categoryPhotoFile, subcategories) => {
  const nameTaken = await isCategoryNameTaken(nombreCategoria);
  if (nameTaken) throw new Error('DUPLICATE_CATEGORY');
  const uniqueNames = new Set(subcategories.map((item) => item.nombre.toLowerCase()));
  if (uniqueNames.size !== subcategories.length) throw new Error('DUPLICATE_SUBCATEGORY_BATCH');
  const categoryPhotoUrl = categoryPhotoFile ? await uploadPhoto('categories', categoryPhotoFile) : null;
  const {data: category, error} = await supabase
    .from('categoria')
    .insert({ nombre_categoria: nombreCategoria, imagen_categoria: categoryPhotoUrl })
    .select('id_categoria')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_CATEGORY');
    throw error;
  }
  for (const item of subcategories) {
    const photoUrl = item.photoFile ? await uploadPhoto('subcategories', item.photoFile) : null;
    await supabase.from('subcategoria').insert({
      id_categoria: category.id_categoria,
      nombre: item.nombre,
      imagen_subcategoria: photoUrl
    });
  }
  return category.id_categoria;
};

/* Obtiene únicamente los nombres de categorías que se encuentran activas para ser utilizadas en selecciones o formularios. */
export const listCategoryNames = async () => {
  const {data} = await supabase
    .from('categoria')
    .select('nombre_categoria')
    .eq('activa', true)
    .order('nombre_categoria');
  return (data || []).map((row) => row.nombre_categoria);
};

/* Obtiene todos los nombres de categorías registradas sin considerar su estado de disponibilidad. */
export const listAllCategoryNames = async () => {
  const {data} = await supabase.from('categoria').select('nombre_categoria').order('nombre_categoria');
  return (data || []).map((row) => row.nombre_categoria);
};

/* Lista las categorías activas junto con la cantidad de subcategorías disponibles asociadas a cada una. */
export const listCategories = async (search) => {
  let query = supabase
    .from('categoria')
    .select('id_categoria, nombre_categoria, imagen_categoria')
    .eq('activa', true)
    .order('nombre_categoria');
  if (search) query = query.ilike('nombre_categoria', `${search}%`);
  const {data: categories} = await query;
  const {data: subcategoryCounts} = await supabase
    .from('subcategoria')
    .select('id_categoria')
    .eq('activa', true);
  return (categories || []).map((category) => ({
    ...category,
    subcategorias_count: (subcategoryCounts || []).filter((row) => row.id_categoria === category.id_categoria).length
  }));
};

/* Lista todas las categorías con su información y estado, permitiendo filtrar por nombre. */
export const listAllCategoriesStatus = async (search) => {
  let query = supabase
    .from('categoria')
    .select('id_categoria, nombre_categoria, imagen_categoria, activa')
    .order('nombre_categoria');
  if (search) query = query.ilike('nombre_categoria', `${search}%`);
  const {data} = await query;
  return data || [];
};

/* Actualiza el nombre y, opcionalmente, la imagen de una categoría, evitando nombres duplicados. */
export const updateCategory = async (idCategoria, nombreCategoria, photoFile) => {
  const nameTaken = await isCategoryNameTaken(nombreCategoria, idCategoria);
  if (nameTaken) throw new Error('DUPLICATE_CATEGORY');
  const updatePayload = {nombre_categoria: nombreCategoria};
  if (photoFile) updatePayload.imagen_categoria = await uploadPhoto('categories', photoFile);
  const {error} = await supabase.from('categoria').update(updatePayload).eq('id_categoria', idCategoria);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_CATEGORY');
    throw error;
  }
};

/* Activa o desactiva una categoría según la disponibilidad indicada. */
export const setCategoryAvailability = async (idCategoria, available) => {
  const { error } = await supabase.from('categoria').update({activa: available}).eq('id_categoria', idCategoria);
  if (error) throw error;
};

/* Lista las subcategorías pertenecientes a una categoría, incluyendo su imagen y estado. */
export const listSubcategoriesByCategory = async (idCategoria) => {
  const {data} = await supabase
    .from('subcategoria')
    .select('id_subcategoria, nombre, imagen_subcategoria, activa')
    .eq('id_categoria', idCategoria)
    .order('nombre');
  return data || [];
};

/* Crea una nueva subcategoría asociada a una categoría, validando nombres duplicados y gestionando su imagen. */
export const addSubcategory = async (idCategoria, nombre, photoFile) => {
  const nameTaken = await isSubcategoryNameTaken(idCategoria, nombre);
  if (nameTaken) throw new Error('DUPLICATE_SUBCATEGORY');
  const photoUrl = photoFile ? await uploadPhoto('subcategories', photoFile) : null;
  const {error} = await supabase
    .from('subcategoria')
    .insert({ id_categoria: idCategoria, nombre, imagen_subcategoria: photoUrl, activa: true });
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_SUBCATEGORY');
    throw error;
  }
};

/* Actualiza el nombre y, opcionalmente, la imagen de una subcategoría, evitando nombres duplicados. */
export const updateSubcategory = async (idSubcategoria, nombre, photoFile) => {
  const {data: current} = await supabase
    .from('subcategoria')
    .select('id_categoria')
    .eq('id_subcategoria', idSubcategoria)
    .single();
  const nameTaken = await isSubcategoryNameTaken(current.id_categoria, nombre, idSubcategoria);
  if (nameTaken) throw new Error('DUPLICATE_SUBCATEGORY');
  const updatePayload = {nombre};
  if (photoFile) updatePayload.imagen_subcategoria = await uploadPhoto('subcategories', photoFile);
  const { error } = await supabase.from('subcategoria').update(updatePayload).eq('id_subcategoria', idSubcategoria);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_SUBCATEGORY');
    throw error;
  }
};

/* Activa o desactiva una subcategoría y sincroniza el estado de sus productos asociados. */
export const setSubcategoryAvailability = async (idSubcategoria, available) => {
  const {error} = await supabase
    .from('subcategoria')
    .update({ activa: available })
    .eq('id_subcategoria', idSubcategoria);
  if (error) throw error;
  await supabase.from('producto').update({activo: available}).eq('id_subcategoria', idSubcategoria);
};

/* Lista las categorías que se encuentran actualmente activas para utilizarlas como opciones. */
export const listActiveCategoryOptions = async () => {
  const {data} = await supabase
    .from('categoria')
    .select('id_categoria, nombre_categoria')
    .eq('activa', true)
    .order('nombre_categoria');
  return data || [];
};

/* Lista las subcategorías activas pertenecientes a una categoría específica para utilizarlas como opciones. */
export const listActiveSubcategoryOptions = async (idCategoria) => {
  const {data} = await supabase
    .from('subcategoria')
    .select('id_subcategoria, nombre')
    .eq('id_categoria', idCategoria)
    .eq('activa', true)
    .order('nombre');
  return data || [];
};