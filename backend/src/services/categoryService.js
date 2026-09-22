import {query} from '../config/db.js';
import {uploadPhoto} from '../utils/storage.js';

/*Verifica si una categoría ya existe para evitar registros duplicados, permitiendo excluir un registro específico durante una modificación */
const isCategoryNameTaken = async (name, excludeId = null) => {
  const result = excludeId
    ? await query(`SELECT id_categoria FROM categoria WHERE nombre_categoria ILIKE $1 AND id_categoria != $2 LIMIT 1`, [name, excludeId])
    : await query(`SELECT id_categoria FROM categoria WHERE nombre_categoria ILIKE $1 LIMIT 1`, [name]);
  return Boolean(result.rows[0]);
};

/*Verifica si una subcategoría ya existe dentro de una categoría determinada, evitando nombres duplicados y permitiendo excluir el registro actual al editar */
const isSubcategoryNameTaken = async (idCategoria, name, excludeId = null) => {
  const result = excludeId
    ? await query(`SELECT id_subcategoria FROM subcategoria WHERE id_categoria = $1 AND nombre ILIKE $2 AND id_subcategoria != $3 LIMIT 1`, [idCategoria, name, excludeId])
    : await query(`SELECT id_subcategoria FROM subcategoria WHERE id_categoria = $1 AND nombre ILIKE $2 LIMIT 1`, [idCategoria, name]);
  return Boolean(result.rows[0]);
};

/* Registra una nueva categoría junto con sus subcategorías asociadas, validando duplicados y almacenando imágenes cuando corresponda */
export const createCategoryWithSubcategories = async (nombreCategoria, categoryPhotoFile, subcategories) => {
  const nameTaken = await isCategoryNameTaken(nombreCategoria);
  if (nameTaken) throw new Error('DUPLICATE_CATEGORY');
  const uniqueNames = new Set(subcategories.map((item) => item.nombre.toLowerCase()));
  if (uniqueNames.size !== subcategories.length) throw new Error('DUPLICATE_SUBCATEGORY_BATCH');
  const categoryPhotoUrl = categoryPhotoFile ? await uploadPhoto('categories', categoryPhotoFile) : null;
  let category;
  try {
    const result = await query(
      `INSERT INTO categoria (nombre_categoria, imagen_categoria) VALUES ($1, $2) RETURNING id_categoria`,
      [nombreCategoria, categoryPhotoUrl]
    );
    category = result.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_CATEGORY');
    throw error;
  }
  for (const item of subcategories) {
    const photoUrl = item.photoFile ? await uploadPhoto('subcategories', item.photoFile) : null;
    await query(
      `INSERT INTO subcategoria (id_categoria, nombre, imagen_subcategoria) VALUES ($1, $2, $3)`,
      [category.id_categoria, item.nombre, photoUrl]
    );
  }
  return category.id_categoria;
};

/* Obtiene únicamente los nombres de categorías que se encuentran activas para ser utilizadas en selecciones o formularios */
export const listCategoryNames = async () => {
  const result = await query(`SELECT nombre_categoria FROM categoria WHERE activa = true ORDER BY nombre_categoria`);
  return result.rows.map((row) => row.nombre_categoria);
};

/* Obtiene todos los nombres de categorías registradas sin considerar su estado de disponibilidad */
export const listAllCategoryNames = async () => {
  const result = await query(`SELECT nombre_categoria FROM categoria ORDER BY nombre_categoria`);
  return result.rows.map((row) => row.nombre_categoria);
};

/* Lista las categorías activas junto con la cantidad de subcategorías disponibles asociadas a cada una */
export const listCategories = async (search) => {
  const categoriesResult = search
    ? await query(`SELECT id_categoria, nombre_categoria, imagen_categoria FROM categoria WHERE activa = true AND nombre_categoria ILIKE $1 ORDER BY nombre_categoria`, [`${search}%`])
    : await query(`SELECT id_categoria, nombre_categoria, imagen_categoria FROM categoria WHERE activa = true ORDER BY nombre_categoria`);
  const countsResult = await query(`SELECT id_categoria FROM subcategoria WHERE activa = true`);
  return categoriesResult.rows.map((category) => ({
    ...category,
    subcategorias_count: countsResult.rows.filter((row) => row.id_categoria === category.id_categoria).length
  }));
};

/* Lista todas las categorías con su información y estado, permitiendo filtrar por nombre */
export const listAllCategoriesStatus = async (search) => {
  const result = search
    ? await query(`SELECT id_categoria, nombre_categoria, imagen_categoria, activa FROM categoria WHERE nombre_categoria ILIKE $1 ORDER BY nombre_categoria`, [`${search}%`])
    : await query(`SELECT id_categoria, nombre_categoria, imagen_categoria, activa FROM categoria ORDER BY nombre_categoria`);
  return result.rows;
};

/* Actualiza el nombre y, opcionalmente, la imagen de una categoría, evitando nombres duplicados */
export const updateCategory = async (idCategoria, nombreCategoria, photoFile) => {
  const nameTaken = await isCategoryNameTaken(nombreCategoria, idCategoria);
  if (nameTaken) throw new Error('DUPLICATE_CATEGORY');
  try {
    if (photoFile) {
      const imagenUrl = await uploadPhoto('categories', photoFile);
      await query(`UPDATE categoria SET nombre_categoria = $1, imagen_categoria = $2 WHERE id_categoria = $3`, [nombreCategoria, imagenUrl, idCategoria]);
    } else {
      await query(`UPDATE categoria SET nombre_categoria = $1 WHERE id_categoria = $2`, [nombreCategoria, idCategoria]);
    }
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_CATEGORY');
    throw error;
  }
};

/* Activa o desactiva una categoría según la disponibilidad indicada */
export const setCategoryAvailability = async (idCategoria, available) => {
  await query(`UPDATE categoria SET activa = $1 WHERE id_categoria = $2`, [available, idCategoria]);
};

/* Lista las subcategorías pertenecientes a una categoría, incluyendo su imagen y estado */
export const listSubcategoriesByCategory = async (idCategoria) => {
  const result = await query(
    `SELECT id_subcategoria, nombre, imagen_subcategoria, activa FROM subcategoria WHERE id_categoria = $1 ORDER BY nombre`,
    [idCategoria]
  );
  return result.rows;
};

/* Crea una nueva subcategoría asociada a una categoría, validando nombres duplicados y gestionando su imagen */
export const addSubcategory = async (idCategoria, nombre, photoFile) => {
  const nameTaken = await isSubcategoryNameTaken(idCategoria, nombre);
  if (nameTaken) throw new Error('DUPLICATE_SUBCATEGORY');
  const photoUrl = photoFile ? await uploadPhoto('subcategories', photoFile) : null;
  try {
    await query(
      `INSERT INTO subcategoria (id_categoria, nombre, imagen_subcategoria, activa) VALUES ($1, $2, $3, true)`,
      [idCategoria, nombre, photoUrl]
    );
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_SUBCATEGORY');
    throw error;
  }
};

/* Actualiza el nombre y, opcionalmente, la imagen de una subcategoría, evitando nombres duplicados */
export const updateSubcategory = async (idSubcategoria, nombre, photoFile) => {
  const currentResult = await query(`SELECT id_categoria FROM subcategoria WHERE id_subcategoria = $1`, [idSubcategoria]);
  const current = currentResult.rows[0];
  const nameTaken = await isSubcategoryNameTaken(current.id_categoria, nombre, idSubcategoria);
  if (nameTaken) throw new Error('DUPLICATE_SUBCATEGORY');
  try {
    if (photoFile) {
      const imagenUrl = await uploadPhoto('subcategories', photoFile);
      await query(`UPDATE subcategoria SET nombre = $1, imagen_subcategoria = $2 WHERE id_subcategoria = $3`, [nombre, imagenUrl, idSubcategoria]);
    } else {
      await query(`UPDATE subcategoria SET nombre = $1 WHERE id_subcategoria = $2`, [nombre, idSubcategoria]);
    }
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_SUBCATEGORY');
    throw error;
  }
};

/* Activa o desactiva una subcategoría y sincroniza el estado de sus productos asociados */
export const setSubcategoryAvailability = async (idSubcategoria, available) => {
  await query(`UPDATE subcategoria SET activa = $1 WHERE id_subcategoria = $2`, [available, idSubcategoria]);
  await query(`UPDATE producto SET activo = $1 WHERE id_subcategoria = $2`, [available, idSubcategoria]);
};

/* Lista las categorías que se encuentran actualmente activas para utilizarlas como opciones */
export const listActiveCategoryOptions = async () => {
  const result = await query(`SELECT id_categoria, nombre_categoria FROM categoria WHERE activa = true ORDER BY nombre_categoria`);
  return result.rows;
};

/* Lista las subcategorías activas pertenecientes a una categoría específica para utilizarlas como opciones */
export const listActiveSubcategoryOptions = async (idCategoria) => {
  const result = await query(
    `SELECT id_subcategoria, nombre FROM subcategoria WHERE id_categoria = $1 AND activa = true ORDER BY nombre`,
    [idCategoria]
  );
  return result.rows;
};
