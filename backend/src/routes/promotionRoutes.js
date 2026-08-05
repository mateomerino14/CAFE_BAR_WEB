import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../config/upload.js';
import {
  createPromotionHandler,
  listPromotionNamesHandler,
  listAllPromotionNamesHandler,
  listPromotionsHandler,
  listAllPromotionsStatusHandler,
  getPromotionHandler,
  updatePromotionHandler,
  setPromotionAvailabilityHandler,
  listActivePromotionsNowHandler,
  getPromotionProductsIngredientsHandler
} from '../controllers/promotionController.js';

const router = Router();

router.post('/', authenticate, authorize('REGISTRAR_PROMOCIONES'), upload.any(), createPromotionHandler);
router.get('/names', authenticate, listPromotionNamesHandler);
router.get('/names/all', authenticate, authorize('BAJA_PROMOCIONES'), listAllPromotionNamesHandler);
router.get('/catalog', authenticate, authorize('VER_FAMILIA'), listPromotionsHandler);
router.get('/catalog-pos', authenticate, authorize('REGISTRAR_PEDIDO'), listActivePromotionsNowHandler);
router.get('/', authenticate, authorize('MODIFICAR_PROMOCIONES'), listPromotionsHandler);
router.get('/status', authenticate, authorize('BAJA_PROMOCIONES'), listAllPromotionsStatusHandler);
router.get('/:id/catalog-detail', authenticate, authorize('VER_FAMILIA'), getPromotionHandler);
router.get('/:id/products-ingredients', authenticate, authorize('REGISTRAR_PEDIDO'), getPromotionProductsIngredientsHandler);
router.get('/:id', authenticate, authorize('MODIFICAR_PROMOCIONES'), getPromotionHandler);
router.put('/:id', authenticate, authorize('MODIFICAR_PROMOCIONES'), upload.any(), updatePromotionHandler);
router.put('/:id/availability', authenticate, authorize('BAJA_PROMOCIONES'), setPromotionAvailabilityHandler);

export default router;