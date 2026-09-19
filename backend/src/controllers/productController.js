import {
  createProduct,
  listProductNames,
  listAllProductNames,
  listProducts,
  listAllProductsStatus,
  getProductWithIngredients,
  updateProduct,
  listProductsBySubcategory,
  listProductIngredientsForCustomization,
  getProductCatalogDetail,
  setProductAvailability
} from '../services/productService.js';
import { isValidProductName, isValidDecimal } from '../utils/validators.js';

/* Obtiene un archivo específico del arreglo de archivos recibidos */
const findFile = (files, fieldname) => (files || []).find((file) => file.fieldname === fieldname);

/* Valida los datos de un producto */
const validateProductFields = (fields) => {
  if (!fields.nombre || !fields.precioVenta || !fields.costoFabricacion || !fields.idSubcategoria) {
    return 'Debe llenar los campos obligatorios';
  }
  if (!isValidProductName(fields.nombre)) {
    return 'El nombre contiene caracteres no permitidos';
  }
  if (!isValidDecimal(fields.precioVenta) || !isValidDecimal(fields.costoFabricacion)) {
    return 'Precio y costo deben ser valores numéricos válidos';
  }
  return null;
};

/* Convierte la lista de ingredientes desde formato JSON */
const parseIngredients = (raw) => {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : null;
  } catch (error) {
    return null;
  }
};

/* Valida que cada ingrediente de la receta tenga una cantidad numérica válida (sin negativos ni letras) */
const validateIngredientQuantities = (ingredients) => {
  for (const item of ingredients) {
    if (!isValidDecimal(String(item.cantidad))) {
      return `La cantidad del ingrediente debe ser un número válido (recibido: "${item.cantidad}")`;
    }
  }
  return null;
};

/* Controlador para registrar un nuevo producto */
export const createProductHandler = async (req, res) => {
  const fields = req.body;
  const validationError = validateProductFields(fields);
  if (validationError) {
    return res.status(400).json({message: validationError});
  }
  const ingredients = parseIngredients(fields.ingredients);
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({message: 'El producto debe contener por lo menos un ingrediente'});
  }
  const ingredientsError = validateIngredientQuantities(ingredients);
  if (ingredientsError) {
    return res.status(400).json({message: ingredientsError});
  }
  const photoFile = findFile(req.files, 'photo');
  try {
    await createProduct(fields, photoFile, ingredients);
    return res.status(201).json({message: 'Se ha registrado con éxito el producto'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_PRODUCT') {
      return res.status(409).json({message: 'Este producto ya ha sido registrado'});
    }
    if (error.message === 'INGREDIENT_NOT_FOUND') {
      return res.status(400).json({message: 'Uno de los ingredientes seleccionados ya no existe'});
    }
    return res.status(500).json({message: 'No se pudo registrar el producto'});
  }
};

/* Controlador para listar los nombres de los productos habilitados */
export const listProductNamesHandler = async (req, res) => {
  try {
    const names = await listProductNames();
    return res.json(names);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener productos'});
  }
};

/* Controlador para listar los nombres de todos los productos */
export const listAllProductNamesHandler = async (req, res) => {
  try {
    const names = await listAllProductNames();
    return res.json(names);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener productos'});
  }
};

/* Controlador para listar los productos según el criterio de búsqueda */
export const listProductsHandler = async (req, res) => {
  const {search = ''} = req.query;
  try {
    const products = await listProducts(search);
    return res.json(products);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener productos'});
  }
};

/* Controlador para listar todos los productos con su estado */
export const listAllProductsStatusHandler = async (req, res) => {
  const {search = ''} = req.query;
  try {
    const products = await listAllProductsStatus(search);
    return res.json(products);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener productos'});
  }
};

/* Controlador para obtener un producto con sus ingredientes */
export const getProductHandler = async (req, res) => {
  try {
    const data = await getProductWithIngredients(req.params.id);
    return res.json(data);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el producto'});
  }
};

/* Controlador para modificar un producto */
export const updateProductHandler = async (req, res) => {
  const fields = req.body;
  const validationError = validateProductFields(fields);
  if (validationError) {
    return res.status(400).json({message: validationError});
  }
  const ingredients = parseIngredients(fields.ingredients);
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({message: 'El producto debe contener por lo menos un ingrediente'});
  }
  const ingredientsError = validateIngredientQuantities(ingredients);
  if (ingredientsError) {
    return res.status(400).json({message: ingredientsError});
  }
  const photoFile = findFile(req.files, 'photo');
  try {
    await updateProduct(req.params.id, fields, photoFile, ingredients);
    return res.json({message: 'Se ha registrado con éxito la modificación'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_PRODUCT') {
      return res.status(409).json({message: 'Ya existe un producto con ese nombre'});
    }
    if (error.message === 'INGREDIENT_NOT_FOUND') {
      return res.status(400).json({message: 'Uno de los ingredientes seleccionados ya no existe'});
    }
    return res.status(500).json({message: 'No se pudo modificar el producto'});
  }
};

/* Controlador para cambiar el estado de un producto */
export const setProductAvailabilityHandler = async (req, res) => {
  const {available} = req.body;
  try {
    await setProductAvailability(req.params.id, available);
    return res.json({message: available ? 'Producto habilitado' : 'Producto deshabilitado'});
  } 
  catch (error) {
    return res.status(500).json({message: 'No se pudo actualizar el estado del producto'});
  }
};

/* Controlador para listar los productos de una subcategoría */
export const listProductsBySubcategoryHandler = async (req, res) => {
  try {
    const products = await listProductsBySubcategory(req.params.id);
    return res.json(products);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener productos'});
  }
};

/* Controlador para obtener el detalle de un producto del catálogo */
export const getProductCatalogDetailHandler = async (req, res) => {
  try {
    const detail = await getProductCatalogDetail(req.params.id);
    return res.json(detail);
  }
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el detalle del producto'});
  }
};

/* Controlador para listar los ingredientes de un producto */
export const listProductIngredientsHandler = async (req, res) => {
  try {
    const ingredients = await listProductIngredientsForCustomization(req.params.id);
    return res.json(ingredients);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener ingredientes'});
  }
};