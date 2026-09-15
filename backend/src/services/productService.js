import { query } from '../config/db.js';
import { uploadPhoto } from '../utils/storage.js';

/*Verifica si ya existe un producto con el mismo nombre, permitiendo excluir un producto específico al momento de editar.*/
const isProductNameTaken = async (name, excludeId = null) => {
  const result = excludeId
    ? await query(`SELECT id_prod FROM producto WHERE nom_prod ILIKE $1 AND id_prod != $2 LIMIT 1`, [name, excludeId])
    : await query(`SELECT id_prod FROM producto WHERE nom_prod ILIKE $1 LIMIT 1`, [name]);
  return Boolean(result.rows[0]);
};

/*Inserta los ingredientes asociados a un producto, verificando previamente que cada ingrediente exista en el stock.*/
const insertIngredients = async (idProd, ingredients) => {
  for (const item of ingredients) {
    const stockResult = await query(`SELECT id_ing FROM stock WHERE id_ing = $1`, [item.idIng]);
    if (!stockResult.rows[0]) throw new Error('INGREDIENT_NOT_FOUND');
    await query(
      `INSERT INTO productos_ingredientes (id_prod, id_ing, cantidad_ing_necesitada) VALUES ($1, $2, $3)`,
      [idProd, item.idIng, item.cantidad]
    );
  }
};

/*Crea un nuevo producto, validando el nombre, cargando su imagen y asociando los ingredientes correspondientes.*/
export const createProduct = async (fields, photoFile, ingredients) => {
  const nameTaken = await isProductNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_PRODUCT');
  const photoUrl = photoFile ? await uploadPhoto('products', photoFile) : null;

  let product;
  try {
    const result = await query(
      `INSERT INTO producto (nom_prod, descripcion, precio_venta, costo_fabricacion, img_prod, id_subcategoria)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_prod`,
      [fields.nombre, fields.descripcion || null, fields.precioVenta, fields.costoFabricacion, photoUrl, fields.idSubcategoria]
    );
    product = result.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PRODUCT');
    throw error;
  }

  await insertIngredients(product.id_prod, ingredients);
  return product.id_prod;
};

/*Obtiene los nombres de los productos que se encuentran actualmente activos, ordenados alfabéticamente.*/
export const listProductNames = async () => {
  const result = await query(`SELECT nom_prod FROM producto WHERE activo = true ORDER BY nom_prod`);
  return result.rows.map((row) => row.nom_prod);
};

/*Obtiene los nombres de todos los productos registrados, incluyendo tanto los activos como los inactivos.*/
export const listAllProductNames = async () => {
  const result = await query(`SELECT nom_prod FROM producto ORDER BY nom_prod`);
  return result.rows.map((row) => row.nom_prod);
};

/*Obtiene la lista de productos activos con sus datos principales y la información de su subcategoría y categoría, permitiendo filtrar por nombre.*/
export const listProducts = async (search) => {
  const baseQuery = `
    SELECT p.id_prod, p.nom_prod, p.precio_venta, p.costo_fabricacion, p.img_prod, p.id_subcategoria,
           s.nombre AS subcategoria_nombre, c.nombre_categoria
    FROM producto p
    JOIN subcategoria s ON s.id_subcategoria = p.id_subcategoria
    JOIN categoria c ON c.id_categoria = s.id_categoria
    WHERE p.activo = true
  `;
  const result = search
    ? await query(`${baseQuery} AND p.nom_prod ILIKE $1 ORDER BY p.nom_prod`, [`${search}%`])
    : await query(`${baseQuery} ORDER BY p.nom_prod`);

  return result.rows.map((row) => ({
    id_prod: row.id_prod,
    nom_prod: row.nom_prod,
    precio_venta: row.precio_venta,
    costo_fabricacion: row.costo_fabricacion,
    img_prod: row.img_prod,
    id_subcategoria: row.id_subcategoria,
    subcategoria: { nombre: row.subcategoria_nombre, categoria: { nombre_categoria: row.nombre_categoria } }
  }));
};

/*Obtiene todos los productos con su estado de disponibilidad y subcategoría, permitiendo filtrar los resultados por nombre.*/
export const listAllProductsStatus = async (search) => {
  const baseQuery = `
    SELECT p.id_prod, p.nom_prod, p.activo, p.img_prod, s.nombre AS subcategoria_nombre
    FROM producto p
    JOIN subcategoria s ON s.id_subcategoria = p.id_subcategoria
  `;
  const result = search
    ? await query(`${baseQuery} WHERE p.nom_prod ILIKE $1 ORDER BY p.nom_prod`, [`${search}%`])
    : await query(`${baseQuery} ORDER BY p.nom_prod`);

  return result.rows.map((row) => ({
    id_prod: row.id_prod,
    nom_prod: row.nom_prod,
    activo: row.activo,
    img_prod: row.img_prod,
    subcategoria: { nombre: row.subcategoria_nombre }
  }));
};

/*Obtiene la información completa de un producto junto con los ingredientes que requiere y los datos correspondientes de cada ingrediente.*/
export const getProductWithIngredients = async (idProd) => {
  const productResult = await query(
    `SELECT p.id_prod, p.nom_prod, p.descripcion, p.precio_venta, p.costo_fabricacion, p.img_prod, p.id_subcategoria, s.id_categoria
     FROM producto p
     JOIN subcategoria s ON s.id_subcategoria = p.id_subcategoria
     WHERE p.id_prod = $1`,
    [idProd]
  );
  const productRow = productResult.rows[0];
  const product = productRow ? {
    id_prod: productRow.id_prod,
    nom_prod: productRow.nom_prod,
    descripcion: productRow.descripcion,
    precio_venta: productRow.precio_venta,
    costo_fabricacion: productRow.costo_fabricacion,
    img_prod: productRow.img_prod,
    id_subcategoria: productRow.id_subcategoria,
    subcategoria: { id_categoria: productRow.id_categoria }
  } : null;

  const ingredientsResult = await query(
    `SELECT pi.id_ing, pi.cantidad_ing_necesitada, s.nom_ing, s.descripcion, s.unidad_medida
     FROM productos_ingredientes pi
     JOIN stock s ON s.id_ing = pi.id_ing
     WHERE pi.id_prod = $1`,
    [idProd]
  );
  const ingredients = ingredientsResult.rows.map((row) => ({
    id_ing: row.id_ing,
    cantidad_ing_necesitada: row.cantidad_ing_necesitada,
    stock: { nom_ing: row.nom_ing, descripcion: row.descripcion, unidad_medida: row.unidad_medida }
  }));

  return { product, ingredients };
};

/*Actualiza los datos de un producto, reemplaza opcionalmente su imagen y actualiza los ingredientes asociados al producto.*/
export const updateProduct = async (idProd, fields, photoFile, ingredients) => {
  const nameTaken = await isProductNameTaken(fields.nombre, idProd);
  if (nameTaken) throw new Error('DUPLICATE_PRODUCT');

  try {
    if (photoFile) {
      const imagenUrl = await uploadPhoto('products', photoFile);
      await query(
        `UPDATE producto SET nom_prod = $1, descripcion = $2, precio_venta = $3, costo_fabricacion = $4, id_subcategoria = $5, img_prod = $6
         WHERE id_prod = $7`,
        [fields.nombre, fields.descripcion || null, fields.precioVenta, fields.costoFabricacion, fields.idSubcategoria, imagenUrl, idProd]
      );
    } else {
      await query(
        `UPDATE producto SET nom_prod = $1, descripcion = $2, precio_venta = $3, costo_fabricacion = $4, id_subcategoria = $5
         WHERE id_prod = $6`,
        [fields.nombre, fields.descripcion || null, fields.precioVenta, fields.costoFabricacion, fields.idSubcategoria, idProd]
      );
    }
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_PRODUCT');
    throw error;
  }

  await query(`DELETE FROM productos_ingredientes WHERE id_prod = $1`, [idProd]);
  await insertIngredients(idProd, ingredients);
};

/*Actualiza la disponibilidad de un producto cambiando su estado entre activo y no disponible.*/
export const setProductAvailability = async (idProd, available) => {
  await query(`UPDATE producto SET activo = $1 WHERE id_prod = $2`, [available, idProd]);
};

/*Obtiene los productos activos pertenecientes a una subcategoría específica, ordenados alfabéticamente por nombre.*/
export const listProductsBySubcategory = async (idSubcategoria) => {
  const result = await query(
    `SELECT id_prod, nom_prod, precio_venta, costo_fabricacion, img_prod
     FROM producto WHERE id_subcategoria = $1 AND activo = true ORDER BY nom_prod`,
    [idSubcategoria]
  );
  return result.rows;
};

/*Obtiene la descripción y los ingredientes disponibles de un producto para mostrar el detalle correspondiente en el catálogo.*/
export const getProductCatalogDetail = async (idProd) => {
  const productResult = await query(`SELECT descripcion FROM producto WHERE id_prod = $1`, [idProd]);
  const ingredientsResult = await query(
    `SELECT pi.cantidad_ing_necesitada, s.nom_ing, s.cantidad_stock, s.unidad_medida
     FROM productos_ingredientes pi
     JOIN stock s ON s.id_ing = pi.id_ing
     WHERE pi.id_prod = $1`,
    [idProd]
  );
  const ingredients = ingredientsResult.rows.map((row) => ({
    cantidad_ing_necesitada: row.cantidad_ing_necesitada,
    stock: { nom_ing: row.nom_ing, cantidad_stock: row.cantidad_stock, unidad_medida: row.unidad_medida }
  }));
  return { descripcion: productResult.rows[0]?.descripcion || null, ingredients };
};

/*Obtiene los ingredientes configurados para un producto junto con su precio extra, utilizados para permitir la personalización del producto.*/
export const listProductIngredientsForCustomization = async (idProd) => {
  const result = await query(
    `SELECT pi.id_ing, pi.cantidad_ing_necesitada, s.nom_ing, s.precio_extra
     FROM productos_ingredientes pi
     JOIN stock s ON s.id_ing = pi.id_ing
     WHERE pi.id_prod = $1`,
    [idProd]
  );
  return result.rows.map((row) => ({
    id_ing: row.id_ing,
    nom_ing: row.nom_ing,
    precio_extra: row.precio_extra
  }));
};
