import { createCategoryWithSubcategories,
  listCategoryNames,
  listAllCategoryNames,
  listCategories,
  listAllCategoriesStatus,
  updateCategory,
  setCategoryAvailability,
  listSubcategoriesByCategory,
  addSubcategory,
  updateSubcategory,
  setSubcategoryAvailability,
  listActiveCategoryOptions,
  listActiveSubcategoryOptions
} from '../services/categoryService.js';

const findFile = (files, fieldname) => (files || []).find((file) => file.fieldname === fieldname);

/* Controlador para registrar una categoría con sus subcategorías */
export const createCategoryHandler = async (req, res) => {
  const { nombreCategoria, subcategoriesMeta } = req.body;
  if (!nombreCategoria || !nombreCategoria.trim()) {
    return res.status(400).json({message: 'El nombre de la categoría no puede estar vacío'});
  }
  let subcategoriesList;
  try {
    subcategoriesList = JSON.parse(subcategoriesMeta || '[]');
  } 
  catch (error) {
    return res.status(400).json({message: 'Datos de subcategorías inválidos'});
  }
  if (!Array.isArray(subcategoriesList) || subcategoriesList.length === 0){
    return res.status(400).json({message: 'La categoría debe tener por lo menos una subcategoría'});
  }
  const categoryPhotoFile = findFile(req.files, 'categoryPhoto');
  const subcategories = subcategoriesList.map((item, index) => ({
    nombre: item.nombre,
    photoFile: findFile(req.files, `subcategoryPhoto_${index}`)
  }));
  try {
    await createCategoryWithSubcategories(nombreCategoria.trim(), categoryPhotoFile, subcategories);
    return res.status(201).json({message: '¡Se ha registrado con éxito!'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_CATEGORY') {
      return res.status(409).json({message: 'La categoría ya existe'});
    }
    if (error.message === 'DUPLICATE_SUBCATEGORY_BATCH') {
      return res.status(409).json({message: 'La subcategoría ya está registrada'});
    }
    return res.status(500).json({message: 'No se pudo registrar la categoría'});
  }
};

/* Controlador para listar los nombres de las categorías habilitadas */
export const listCategoryNamesHandler = async (req, res) => {
  try {
    const names = await listCategoryNames();
    return res.json(names);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener categorías'});
  }
};

/* Controlador para listar los nombres de todas las categorías */
export const listAllCategoryNamesHandler = async (req, res) => {
  try {
    const names = await listAllCategoryNames();
    return res.json(names);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener categorías'});
  }
};

/* Controlador para listar las categorías según el criterio de busqueda */
export const listCategoriesHandler = async (req, res) => {
  const { search = '' } = req.query;
  try {
    const categories = await listCategories(search);
    return res.json(categories);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener categorías'});
  }
};

/* Controlador para listar todas las categorías con su estado */
export const listAllCategoriesStatusHandler = async (req, res) => {
  const {search = ''} = req.query;
  try {
    const categories = await listAllCategoriesStatus(search);
    return res.json(categories);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener categorías'});
  }
};

/* Controlador para modificar una categoría */
export const updateCategoryHandler = async (req, res) => {
  const { nombreCategoria } = req.body;
  if (!nombreCategoria || !nombreCategoria.trim()) {
    return res.status(400).json({message: 'El nombre de la categoría no puede estar vacío'});
  }
  const photoFile = findFile(req.files, 'categoryPhoto');
  try {
    await updateCategory(req.params.id, nombreCategoria.trim(), photoFile);
    return res.json({message: 'Se ha registrado con éxito la modificación'});
  } catch (error) {
    if (error.message === 'DUPLICATE_CATEGORY') {
      return res.status(409).json({message: 'Ya existe una categoría con ese nombre'});
    }
    return res.status(500).json({message: 'No se pudo modificar la categoría'});
  }
};

/* Controlador para cambiar el estado de una categoría */
export const setCategoryAvailabilityHandler = async (req, res) => {
  const {available} = req.body;
  try {
    await setCategoryAvailability(req.params.id, available);
    return res.json({message: available ? 'Categoría habilitada' : 'Categoría deshabilitada'});
  } 
  catch (error) {
    return res.status(500).json({message: 'No se pudo actualizar el estado de la categoría'});
  }
};

/* Controlador para listar las subcategorías de una categoría */
export const listSubcategoriesHandler = async (req, res) => {
  try {
    const subcategories = await listSubcategoriesByCategory(req.params.id);
    return res.json(subcategories);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener subcategorías'});
  }
};

/* Controlador para agregar una subcategoría a una categoría */
export const addSubcategoryHandler = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({message: 'El nombre de la subcategoría no puede estar vacío'});
  }
  const photoFile = findFile(req.files, 'subcategoryPhoto');
  try {
    await addSubcategory(req.params.id, nombre.trim(), photoFile);
    return res.status(201).json({message: 'Subcategoría agregada correctamente'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_SUBCATEGORY') {
      return res.status(409).json({message: 'Ya existe una subcategoría con ese nombre en esta categoría'});
    }
    return res.status(500).json({message: 'No se pudo agregar la subcategoría'});
  }
};

/* Controlador para modificar una subcategoría */
export const updateSubcategoryHandler = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({message: 'El nombre de la subcategoría no puede estar vacío'});
  }
  const photoFile = findFile(req.files, 'subcategoryPhoto');
  try {
    await updateSubcategory(req.params.id, nombre.trim(), photoFile);
    return res.json({message: 'Subcategoría actualizada correctamente'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_SUBCATEGORY') {
      return res.status(409).json({message: 'Ya existe una subcategoría con ese nombre en esta categoría'});
    }
    return res.status(500).json({message: 'No se pudo modificar la subcategoría'});
  }
};

/* Controlador para cambiar el estado de una subcategoría */
export const setSubcategoryAvailabilityHandler = async (req, res) => {
  const {available} = req.body;
  try {
    await setSubcategoryAvailability(req.params.id, available);
    return res.json({message: available ? 'Subcategoría activada correctamente' : 'Subcategoría desactivada correctamente'});
  } 
  catch (error) {
    return res.status(500).json({message: 'No se pudo cambiar el estado de la subcategoría'});
  }
};

/* Controlador para listar las categorías activas como opciones */
export const listCategoryOptionsHandler = async (req, res) => {
  try {
    const options = await listActiveCategoryOptions();
    return res.json(options);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener categorías'});
  }
};

/* Controlador para listar las subcategorías activas de una categoría como opciones */
export const listSubcategoryOptionsHandler = async (req, res) => {
  try {
    const options = await listActiveSubcategoryOptions(req.params.id);
    return res.json(options);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener subcategorías'});
  }
};