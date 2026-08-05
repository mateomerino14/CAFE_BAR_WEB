import {
  createPromotion,
  listPromotionNames,
  listAllPromotionNames,
  listPromotions,
  listAllPromotionsStatus,
  getPromotionDetail,
  updatePromotion,
  setPromotionAvailability,
  listActivePromotionsNow,
  getPromotionProductsWithIngredients
} from '../services/promotionService.js';

const findFile = (files, fieldname) => (files || []).find((file) => file.fieldname === fieldname);

const parseJson = (raw, fallback) => {
  try {
    return JSON.parse(raw || JSON.stringify(fallback));
  } catch (error) {
    return null;
  }
};

const validateFields = (fields, products, schedule, days) => {
  if (!fields.nombre || !fields.precioProm) {
    return 'Debe llenar los campos obligatorios';
  }
  if (!products || products.length === 0) {
    return 'La promoción debe tener por lo menos un producto';
  }
  if (schedule?.scheduleType === 'specific' && !schedule.fechaEspecifica) {
    return 'Seleccione la fecha específica de la promoción';
  }
  if (schedule?.scheduleType === 'range' && (!schedule.fechaInicio || !schedule.fechaFin)) {
    return 'Seleccione el rango de fechas de la promoción';
  }
  if ((schedule?.scheduleType === 'recurring' || (schedule?.scheduleType === 'range' && schedule?.daysEnabled)) && (!days || days.length === 0)) {
    return 'Seleccione por lo menos un día de la semana';
  }
  return null;
};

export const createPromotionHandler = async (req, res) => {
  const fields = req.body;
  const products = parseJson(fields.products, []);
  const schedule = parseJson(fields.schedule, {});
  const days = parseJson(fields.days, []);

  const validationError = validateFields(fields, products, schedule, days);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const imageFile = findFile(req.files, 'photo');

  try {
    await createPromotion(fields, imageFile, products, schedule, days);
    return res.status(201).json({ message: 'La promoción se registró con éxito' });
  } catch (error) {
    if (error.message === 'DUPLICATE_PROMOTION') {
      return res.status(409).json({ message: 'Esta promoción ya ha sido registrada' });
    }
    return res.status(500).json({ message: 'No se pudo registrar la promoción' });
  }
};

export const listPromotionNamesHandler = async (req, res) => {
  try {
    const names = await listPromotionNames();
    return res.json(names);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener promociones' });
  }
};

export const listAllPromotionNamesHandler = async (req, res) => {
  try {
    const names = await listAllPromotionNames();
    return res.json(names);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener promociones' });
  }
};

export const listPromotionsHandler = async (req, res) => {
  const { search = '' } = req.query;

  try {
    const promotions = await listPromotions(search);
    return res.json(promotions);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener promociones' });
  }
};

export const listAllPromotionsStatusHandler = async (req, res) => {
  const { search = '' } = req.query;

  try {
    const promotions = await listAllPromotionsStatus(search);
    return res.json(promotions);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener promociones' });
  }
};

export const getPromotionHandler = async (req, res) => {
  try {
    const data = await getPromotionDetail(req.params.id);
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener la promoción' });
  }
};

export const updatePromotionHandler = async (req, res) => {
  const fields = req.body;
  const products = parseJson(fields.products, []);
  const schedule = parseJson(fields.schedule, {});
  const days = parseJson(fields.days, []);

  const validationError = validateFields(fields, products, schedule, days);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const imageFile = findFile(req.files, 'photo');

  try {
    await updatePromotion(req.params.id, fields, imageFile, products, schedule, days);
    return res.json({ message: 'Se ha registrado con éxito la modificación' });
  } catch (error) {
    if (error.message === 'DUPLICATE_PROMOTION') {
      return res.status(409).json({ message: 'Ya existe una promoción con ese nombre' });
    }
    return res.status(500).json({ message: 'No se pudo modificar la promoción' });
  }
};

export const setPromotionAvailabilityHandler = async (req, res) => {
  const { available } = req.body;

  try {
    await setPromotionAvailability(req.params.id, available);
    return res.json({ message: available ? 'Promoción habilitada' : 'Promoción deshabilitada' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar el estado de la promoción' });
  }
};

export const listActivePromotionsNowHandler = async (req, res) => {
  try {
    const promotions = await listActivePromotionsNow();
    return res.json(promotions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener promociones' });
  }
};

export const getPromotionProductsIngredientsHandler = async (req, res) => {
  try {
    const products = await getPromotionProductsWithIngredients(req.params.id);
    return res.json(products);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener los productos de la promoción' });
  }
};