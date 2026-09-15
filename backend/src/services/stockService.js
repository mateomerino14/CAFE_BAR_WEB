import { query } from '../config/db.js';

/*Obtiene las opciones de stock disponibles, incluyendo sus datos básicos y unidad de medida.*/
export const listStockOptions = async () => {
  const result = await query(
    `SELECT id_ing, nom_ing, descripcion, unidad_medida FROM stock WHERE disponible = true ORDER BY nom_ing`
  );
  return result.rows;
};

/*Verifica si ya existe un ingrediente con el mismo nombre, permitiendo excluir un registro específico al editar.*/
const isStockNameTaken = async (name, excludeId = null) => {
  const result = excludeId
    ? await query(`SELECT id_ing FROM stock WHERE nom_ing ILIKE $1 AND id_ing != $2 LIMIT 1`, [name, excludeId])
    : await query(`SELECT id_ing FROM stock WHERE nom_ing ILIKE $1 LIMIT 1`, [name]);
  return Boolean(result.rows[0]);
};

/*Crea un nuevo registro de stock con sus datos, cantidad disponible, unidad de medida y precio adicional.*/
export const createStock = async (fields) => {
  const nameTaken = await isStockNameTaken(fields.nombre);
  if (nameTaken) throw new Error('DUPLICATE_STOCK');
  try {
    await query(
      `INSERT INTO stock (nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra)
       VALUES ($1, $2, $3, $4, $5)`,
      [fields.nombre, fields.descripcion || null, fields.cantidadStock, fields.unidadMedida, fields.precioExtra || 0]
    );
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_STOCK');
    throw error;
  }
};

/*Obtiene los nombres de todos los registros de stock ordenados alfabéticamente.*/
export const listStockNames = async () => {
  const result = await query(`SELECT nom_ing FROM stock ORDER BY nom_ing`);
  return result.rows.map((row) => row.nom_ing);
};

/*Obtiene los registros de stock con sus datos principales, permitiendo filtrar por el inicio del nombre.*/
export const listStock = async (search) => {
  const result = search
    ? await query(`SELECT id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra FROM stock WHERE nom_ing ILIKE $1 ORDER BY nom_ing`, [`${search}%`])
    : await query(`SELECT id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra FROM stock ORDER BY nom_ing`);
  return result.rows;
};

/*Obtiene la información completa de un registro de stock mediante su identificador.*/
export const getStock = async (idIng) => {
  const result = await query(
    `SELECT id_ing, nom_ing, descripcion, cantidad_stock, unidad_medida, precio_extra FROM stock WHERE id_ing = $1`,
    [idIng]
  );
  return result.rows[0];
};

/*Actualiza los datos de un registro de stock, validando que no exista otro ingrediente con el mismo nombre.*/
export const updateStock = async (idIng, fields) => {
  const nameTaken = await isStockNameTaken(fields.nombre, idIng);
  if (nameTaken) throw new Error('DUPLICATE_STOCK');
  try {
    await query(
      `UPDATE stock SET nom_ing = $1, descripcion = $2, cantidad_stock = $3, unidad_medida = $4, precio_extra = $5
       WHERE id_ing = $6`,
      [fields.nombre, fields.descripcion || null, fields.cantidadStock, fields.unidadMedida, fields.precioExtra || 0, idIng]
    );
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_STOCK');
    throw error;
  }
};
