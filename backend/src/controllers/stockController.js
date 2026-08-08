import {listStockOptions, createStock, listStockNames, listStock, getStock, updateStock} from '../services/stockService.js';
import {isLettersOnly, isValidDecimal} from '../utils/validators.js';

/* Controlador para listar las opciones de ingredientes disponibles */
export const listStockOptionsHandler = async (req, res) => {
  try {
    const options = await listStockOptions();
    return res.json(options);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener ingredientes'});
  }
};

/* Valida los datos de un ingrediente del inventario */
const validateStockFields = (fields) => {
  if (!fields.nombre || !fields.unidadMedida || !fields.cantidadStock) {
    return 'Llene los campos obligatorios porfavor';
  }
  if (!isLettersOnly(fields.nombre)) {
    return 'El nombre solo debe contener letras';
  }
  if (!isValidDecimal(fields.cantidadStock)) {
    return 'La cantidad de stock debe ser un valor numérico válido';
  }
  if (fields.precioExtra && !isValidDecimal(fields.precioExtra)) {
    return 'El precio extra debe ser un valor numérico válido';
  }
  return null;
};

/* Controlador para registrar un nuevo ingrediente en stock */
export const createStockHandler = async (req, res) => {
  const validationError = validateStockFields(req.body);
  if (validationError) {
    return res.status(400).json({message: validationError});
  }
  try {
    await createStock(req.body);
    return res.status(201).json({message: 'Se ha registrado con éxito'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_STOCK') {
      return res.status(409).json({message: 'Este ingrediente ya ha sido registrado'});
    }
    return res.status(500).json({message: 'No se pudo registrar el ingrediente'});
  }
};

/* Controlador para listar los nombres de los ingredientes */
export const listStockNamesHandler = async (req, res) => {
  try {
    const names = await listStockNames();
    return res.json(names);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener ingredientes'});
  }
};

/* Controlador para listar los ingredientes según el criterio de búsqueda */
export const listStockHandler = async (req, res) => {
  const {search = ''} = req.query;
  try {
    const stock = await listStock(search);
    return res.json(stock);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener ingredientes'});
  }
};

/* Controlador para obtener el detalle de un ingrediente */
export const getStockHandler = async (req, res) => {
  try {
    const stock = await getStock(req.params.id);
    return res.json(stock);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener el ingrediente'});
  }
};

/* Controlador para modificar un ingrediente del inventario */
export const updateStockHandler = async (req, res) => {
  const validationError = validateStockFields(req.body);
  if (validationError) {
    return res.status(400).json({message: validationError});
  }
  try {
    await updateStock(req.params.id, req.body);
    return res.json({message: 'Ingrediente modificado exitosamente'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_STOCK') {
      return res.status(409).json({message: 'Este ingrediente ya está registrado'});
    }
    return res.status(500).json({message: 'No se pudo modificar el ingrediente'});
  }
};