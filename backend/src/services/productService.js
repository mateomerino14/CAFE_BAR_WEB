import { supabase } from '../config/supabaseClient.js';
import { uploadPhoto } from '../utils/storage.js';

const isProductNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('producto').select('id_prod').ilike('nom_prod', name);
  if (excludeId) query = query.neq('id_prod', excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

const insertIngredients = async (idProd, ingredients) => {
  for (const item of ingredients) {
    const { data: stockItem } = await supabase.from('stock').select('id_ing').eq('id_ing', item.idIng).maybeSingle();
    if (!stockItem) throw new Error('INGREDIENT_NOT_FOUND');
    await supabase.from('productos_ingredientes').insert({
      id_prod: idProd,
      id_ing: item.idIng,
      cantidad_ing_necesitada: item.cantidad
    });
  }
};

export const createProduct = async (fields, photoFile, ingredients) => {
  const nameTaken = await isProductNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_PRODUCT');
  const photoUrl = photoFile ? await uploadPhoto('products', photoFile) : null;
  const { data: product, error } = await supabase
    .from('producto')
    .insert({
      nom_prod: fields.nombre,
      descripcion: fields.descripcion || null,
      precio_venta: fields.precioVenta,
      costo_fabricacion: fields.costoFabricacion,
      img_prod: photoUrl,
      id_subcategoria: fields.idSubcategoria
    })
    .select('id_prod')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PRODUCT');
    throw error;
  }
  await insertIngredients(product.id_prod, ingredients);
  return product.id_prod;
};

export const listProductNames = async () => {
  const { data } = await supabase.from('producto').select('nom_prod').eq('activo', true).order('nom_prod');
  return (data || []).map((row) => row.nom_prod);
};

export const listAllProductNames = async () => {
  const { data } = await supabase.from('producto').select('nom_prod').order('nom_prod');
  return (data || []).map((row) => row.nom_prod);
};

export const listProducts = async (search) => {
  let query = supabase
    .from('producto')
    .select('id_prod, nom_prod, precio_venta, costo_fabricacion, img_prod, id_subcategoria, subcategoria:subcategoria(nombre, categoria:categoria(nombre_categoria))')
    .eq('activo', true)
    .order('nom_prod');
  if (search) query = query.ilike('nom_prod', `${search}%`);
  const { data } = await query;
  return data || [];
};

export const listAllProductsStatus = async (search) => {
  let query = supabase
    .from('producto')
    .select('id_prod, nom_prod, activo, img_prod, subcategoria:subcategoria(nombre)')
    .order('nom_prod');
  if (search) query = query.ilike('nom_prod', `${search}%`);
  const { data } = await query;
  return data || [];
};

export const getProductWithIngredients = async (idProd) => {
  const { data: product } = await supabase
    .from('producto')
    .select('id_prod, nom_prod, descripcion, precio_venta, costo_fabricacion, img_prod, id_subcategoria, subcategoria:subcategoria(id_categoria)')
    .eq('id_prod', idProd)
    .single();
  const { data: ingredients } = await supabase
    .from('productos_ingredientes')
    .select('id_ing, cantidad_ing_necesitada, stock:stock(nom_ing, descripcion, unidad_medida)')
    .eq('id_prod', idProd);
  return { product, ingredients: ingredients || [] };
};

export const updateProduct = async (idProd, fields, photoFile, ingredients) => {
  const nameTaken = await isProductNameTaken(fields.nombre, idProd);
  if (nameTaken) throw new Error('DUPLICATE_PRODUCT');
  const updatePayload = {
    nom_prod: fields.nombre,
    descripcion: fields.descripcion || null,
    precio_venta: fields.precioVenta,
    costo_fabricacion: fields.costoFabricacion,
    id_subcategoria: fields.idSubcategoria
  };
  if (photoFile) updatePayload.img_prod = await uploadPhoto('products', photoFile);
  const { error } = await supabase.from('producto').update(updatePayload).eq('id_prod', idProd);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PRODUCT');
    throw error;
  }
  await supabase.from('productos_ingredientes').delete().eq('id_prod', idProd);
  await insertIngredients(idProd, ingredients);
};

export const setProductAvailability = async (idProd, available) => {
  const { error } = await supabase.from('producto').update({ activo: available }).eq('id_prod', idProd);
  if (error) throw error;
};

export const listProductsBySubcategory = async (idSubcategoria) => {
  const { data } = await supabase
    .from('producto')
    .select('id_prod, nom_prod, precio_venta, costo_fabricacion, img_prod')
    .eq('id_subcategoria', idSubcategoria)
    .eq('activo', true)
    .order('nom_prod');
  return data || [];
};

export const getProductCatalogDetail = async (idProd) => {
  const { data: product } = await supabase.from('producto').select('descripcion').eq('id_prod', idProd).single();
  const { data: ingredients } = await supabase
    .from('productos_ingredientes')
    .select('cantidad_ing_necesitada, stock:stock(nom_ing, cantidad_stock, unidad_medida)')
    .eq('id_prod', idProd);
  return { descripcion: product?.descripcion || null, ingredients: ingredients || [] };
};

export const listProductIngredientsForCustomization = async (idProd) => {
  const { data } = await supabase
    .from('productos_ingredientes')
    .select('id_ing, cantidad_ing_necesitada, stock:stock(nom_ing, precio_extra)')
    .eq('id_prod', idProd);
  return (data || []).map((row) => ({
    id_ing: row.id_ing,
    nom_ing: row.stock?.nom_ing,
    precio_extra: row.stock?.precio_extra
  }));
};