import { supabase } from '../config/supabaseClient.js';
import { uploadPhoto } from '../utils/storage.js';

/*Verifica si ya existe un producto con el mismo nombre, permitiendo excluir un producto específico al momento de editar.*/
const isProductNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('producto').select('id_prod').ilike('nom_prod', name);
  if (excludeId) query = query.neq('id_prod', excludeId);
  const {data} = await query.maybeSingle();
  return Boolean(data);
};


/*Inserta los ingredientes asociados a un producto, verificando previamente que cada ingrediente exista en el stock.*/
const insertIngredients = async (idProd, ingredients) => {
  for (const item of ingredients) {
    const {data: stockItem} = await supabase.from('stock').select('id_ing').eq('id_ing', item.idIng).maybeSingle();
    if (!stockItem) throw new Error('INGREDIENT_NOT_FOUND');
    await supabase.from('productos_ingredientes').insert({
      id_prod: idProd,
      id_ing: item.idIng,
      cantidad_ing_necesitada: item.cantidad
    });
  }
};


/*Crea un nuevo producto, validando el nombre, cargando su imagen y asociando los ingredientes correspondientes.*/
export const createProduct = async (fields, photoFile, ingredients) => {
  const nameTaken = await isProductNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_PRODUCT');
  const photoUrl = photoFile ? await uploadPhoto('products', photoFile) : null;
  const {data: product, error} = await supabase
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


/*Obtiene los nombres de los productos que se encuentran actualmente activos, ordenados alfabéticamente.*/
export const listProductNames = async () => {
  const {data} = await supabase.from('producto').select('nom_prod').eq('activo', true).order('nom_prod');
  return (data || []).map((row) => row.nom_prod);
};


/*Obtiene los nombres de todos los productos registrados, incluyendo tanto los activos como los inactivos.*/
export const listAllProductNames = async () => {
  const {data} = await supabase.from('producto').select('nom_prod').order('nom_prod');
  return (data || []).map((row) => row.nom_prod);
};


/*Obtiene la lista de productos activos con sus datos principales y la información de su subcategoría y categoría, permitiendo filtrar por nombre.*/
export const listProducts = async (search) => {
  let query = supabase
    .from('producto')
    .select('id_prod, nom_prod, precio_venta, costo_fabricacion, img_prod, id_subcategoria, subcategoria:subcategoria(nombre, categoria:categoria(nombre_categoria))')
    .eq('activo', true)
    .order('nom_prod');
  if (search) query = query.ilike('nom_prod', `${search}%`);
  const {data} = await query;
  return data || [];
};


/*Obtiene todos los productos con su estado de disponibilidad y subcategoría, permitiendo filtrar los resultados por nombre.*/
export const listAllProductsStatus = async (search) => {
  let query = supabase
    .from('producto')
    .select('id_prod, nom_prod, activo, img_prod, subcategoria:subcategoria(nombre)')
    .order('nom_prod');
  if (search) query = query.ilike('nom_prod', `${search}%`);
  const {data} = await query;
  return data || [];
};


/*Obtiene la información completa de un producto junto con los ingredientes que requiere y los datos correspondientes de cada ingrediente.*/
export const getProductWithIngredients = async (idProd) => {
  const {data: product} = await supabase
    .from('producto')
    .select('id_prod, nom_prod, descripcion, precio_venta, costo_fabricacion, img_prod, id_subcategoria, subcategoria:subcategoria(id_categoria)')
    .eq('id_prod', idProd)
    .single();
  const {data: ingredients} = await supabase
    .from('productos_ingredientes')
    .select('id_ing, cantidad_ing_necesitada, stock:stock(nom_ing, descripcion, unidad_medida)')
    .eq('id_prod', idProd);
  return {product, ingredients: ingredients || []};
};


/*Actualiza los datos de un producto, reemplaza opcionalmente su imagen y actualiza los ingredientes asociados al producto.*/
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
  const {error} = await supabase.from('producto').update(updatePayload).eq('id_prod', idProd);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PRODUCT');
    throw error;
  }
  await supabase.from('productos_ingredientes').delete().eq('id_prod', idProd);
  await insertIngredients(idProd, ingredients);
};


/*Actualiza la disponibilidad de un producto cambiando su estado entre activo y no disponible.*/
export const setProductAvailability = async (idProd, available) => {
  const {error} = await supabase.from('producto').update({ activo: available }).eq('id_prod', idProd);
  if (error) throw error;
};


/*Obtiene los productos activos pertenecientes a una subcategoría específica, ordenados alfabéticamente por nombre.*/
export const listProductsBySubcategory = async (idSubcategoria) => {
  const {data} = await supabase
    .from('producto')
    .select('id_prod, nom_prod, precio_venta, costo_fabricacion, img_prod')
    .eq('id_subcategoria', idSubcategoria)
    .eq('activo', true)
    .order('nom_prod');
  return data || [];
};


/*Obtiene la descripción y los ingredientes disponibles de un producto para mostrar el detalle correspondiente en el catálogo.*/
export const getProductCatalogDetail = async (idProd) => {
  const {data: product} = await supabase.from('producto').select('descripcion').eq('id_prod', idProd).single();
  const {data: ingredients} = await supabase
    .from('productos_ingredientes')
    .select('cantidad_ing_necesitada, stock:stock(nom_ing, cantidad_stock, unidad_medida)')
    .eq('id_prod', idProd);
  return {descripcion: product?.descripcion || null, ingredients: ingredients || []};
};


/*Obtiene los ingredientes configurados para un producto junto con su precio extra, utilizados para permitir la personalización del producto.*/
export const listProductIngredientsForCustomization = async (idProd) => {
  const {data} = await supabase
    .from('productos_ingredientes')
    .select('id_ing, cantidad_ing_necesitada, stock:stock(nom_ing, precio_extra)')
    .eq('id_prod', idProd);
  return (data || []).map((row) => ({
    id_ing: row.id_ing,
    nom_ing: row.stock?.nom_ing,
    precio_extra: row.stock?.precio_extra
  }));
};