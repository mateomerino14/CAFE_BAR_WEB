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

const findFile = (files, fieldname) => (files || []).find((file) => file.fieldname === fieldname);

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

const parseIngredients = (raw) => {
  try {
    const list = JSON.parse(raw || '[]');
    return Array.isArray(list) ? list : null;
  } catch (error) {
    return null;
  }
};

export const createProductHandler = async (req, res) => {
  const fields = req.body;
  const validationError = validateProductFields(fields);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  const ingredients = parseIngredients(fields.ingredients);
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: 'El producto debe contener por lo menos un ingrediente' });
  }
  const photoFile = findFile(req.files, 'photo');
  try {
    await createProduct(fields, photoFile, ingredients);
    return res.status(201).json({ message: 'Se ha registrado con éxito el producto' });
  } catch (error) {
    if (error.message === 'DUPLICATE_PRODUCT') {
      return res.status(409).json({ message: 'Este producto ya ha sido registrado' });
    }
    if (error.message === 'INGREDIENT_NOT_FOUND') {
      return res.status(400).json({ message: 'Uno de los ingredientes seleccionados ya no existe' });
    }
    return res.status(500).json({ message: 'No se pudo registrar el producto' });
  }
};

export const listProductNamesHandler = async (req, res) => {
  try {
    const names = await listProductNames();
    return res.json(names);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const listAllProductNamesHandler = async (req, res) => {
  try {
    const names = await listAllProductNames();
    return res.json(names);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const listProductsHandler = async (req, res) => {
  const { search = '' } = req.query;
  try {
    const products = await listProducts(search);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const listAllProductsStatusHandler = async (req, res) => {
  const { search = '' } = req.query;
  try {
    const products = await listAllProductsStatus(search);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const getProductHandler = async (req, res) => {
  try {
    const data = await getProductWithIngredients(req.params.id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

export const updateProductHandler = async (req, res) => {
  const fields = req.body;
  const validationError = validateProductFields(fields);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  const ingredients = parseIngredients(fields.ingredients);
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: 'El producto debe contener por lo menos un ingrediente' });
  }
  const photoFile = findFile(req.files, 'photo');
  try {
    await updateProduct(req.params.id, fields, photoFile, ingredients);
    return res.json({ message: 'Se ha registrado con éxito la modificación' });
  } catch (error) {
    if (error.message === 'DUPLICATE_PRODUCT') {
      return res.status(409).json({ message: 'Ya existe un producto con ese nombre' });
    }
    if (error.message === 'INGREDIENT_NOT_FOUND') {
      return res.status(400).json({ message: 'Uno de los ingredientes seleccionados ya no existe' });
    }
    return res.status(500).json({ message: 'No se pudo modificar el producto' });
  }
};

export const setProductAvailabilityHandler = async (req, res) => {
  const { available } = req.body;
  try {
    await setProductAvailability(req.params.id, available);
    return res.json({ message: available ? 'Producto habilitado' : 'Producto deshabilitado' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar el estado del producto' });
  }
};


export const listProductsBySubcategoryHandler = async (req, res) => {
  try {
    const products = await listProductsBySubcategory(req.params.id);
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};

export const getProductCatalogDetailHandler = async (req, res) => {
  try {
    const detail = await getProductCatalogDetail(req.params.id);
    return res.json(detail);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener el detalle del producto' });
  }
};

export const listProductIngredientsHandler = async (req, res) => {
  try {
    const ingredients = await listProductIngredientsForCustomization(req.params.id);
    return res.json(ingredients);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener ingredientes' });
  }
};