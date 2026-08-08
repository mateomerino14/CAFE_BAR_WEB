import {Router} from 'express';
import {authenticate} from '../middlewares/authenticate.js';
import {authorize} from '../middlewares/authorize.js';
import {upload} from '../config/upload.js';
import {
  createCategoryHandler,
  listCategoryNamesHandler,
  listAllCategoryNamesHandler,
  listCategoriesHandler,
  listAllCategoriesStatusHandler,
  updateCategoryHandler,
  setCategoryAvailabilityHandler,
  listSubcategoriesHandler,
  addSubcategoryHandler,
  listCategoryOptionsHandler,
  listSubcategoryOptionsHandler
} from '../controllers/categoryController.js';

const router = Router();

/* Rutas para la gestión de categorías y subcategorías de productos */
router.post('/', authenticate, authorize('REGISTRAR_CATEGORIA'), upload.any(), createCategoryHandler);
router.get('/names', authenticate, listCategoryNamesHandler);
router.get('/names/all', authenticate, authorize('BAJA_CATEGORIA'), listAllCategoryNamesHandler);
router.get('/options', authenticate, listCategoryOptionsHandler);
router.get('/', authenticate, authorize('MODIFICAR_CATEGORIA'), listCategoriesHandler);
router.get('/status', authenticate, authorize('BAJA_CATEGORIA'), listAllCategoriesStatusHandler);
router.put('/:id', authenticate, authorize('MODIFICAR_CATEGORIA'), upload.any(), updateCategoryHandler);
router.put('/:id/availability', authenticate, authorize('BAJA_CATEGORIA'), setCategoryAvailabilityHandler);
router.get('/:id/subcategories', authenticate, authorize('MODIFICAR_CATEGORIA'), listSubcategoriesHandler);
router.post('/:id/subcategories', authenticate, authorize('MODIFICAR_CATEGORIA'), upload.any(), addSubcategoryHandler);
router.get('/:id/subcategory-options', authenticate, listSubcategoryOptionsHandler);

export default router;