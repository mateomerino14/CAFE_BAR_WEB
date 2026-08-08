import {Router} from 'express';
import {authenticate} from '../middlewares/authenticate.js';
import {authorize} from '../middlewares/authorize.js';
import {upload} from '../config/upload.js';
import {
  createProductHandler,
  listProductNamesHandler,
  listAllProductNamesHandler,
  listProductsHandler,
  listAllProductsStatusHandler,
  getProductHandler,
  updateProductHandler,
  setProductAvailabilityHandler,
  listProductsBySubcategoryHandler,
  getProductCatalogDetailHandler,
  listProductIngredientsHandler
} from '../controllers/productController.js';

const router = Router();

/* Rutas para la gestión de productos del sistema */
router.post('/', authenticate, authorize('REGISTRAR_PRODUCTO'), upload.any(), createProductHandler);
router.get('/names', authenticate, listProductNamesHandler);
router.get('/names/all', authenticate, authorize('BAJA_PRODUCTO'), listAllProductNamesHandler);
router.get('/by-subcategory/:id', authenticate, listProductsBySubcategoryHandler);
router.get('/:id/ingredients', authenticate, authorize('REGISTRAR_PEDIDO'), listProductIngredientsHandler);
router.get('/', authenticate, authorize('MODIFICAR_PRODUCTO'), listProductsHandler);
router.get('/status', authenticate, authorize('BAJA_PRODUCTO'), listAllProductsStatusHandler);
router.get('/:id/catalog-detail', authenticate, authorize('VER_FAMILIA'), getProductCatalogDetailHandler);
router.get('/:id', authenticate, authorize('MODIFICAR_PRODUCTO'), getProductHandler);
router.put('/:id', authenticate, authorize('MODIFICAR_PRODUCTO'), upload.any(), updateProductHandler);
router.put('/:id/availability', authenticate, authorize('BAJA_PRODUCTO'), setProductAvailabilityHandler);

export default router;