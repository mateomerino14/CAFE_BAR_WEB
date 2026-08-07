import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import {
  listSectionsWithTablesHandler,
  createOrderHandler,
  listPendingBatchesHandler,
  getMarkCardsHandler,
  markUnitsHandler,
  getOrderTicketHandler,
  getKitchenTicketHandler,
  verifyPasswordHandler,
  getTaxLinkForCajaHandler,
  getLatestOrderIdHandler,
  getUnmarkedCountHandler,
  applyMarkChangesHandler,
  checkoutOrderHandler,
  getNextSaleNumberHandler
} from '../controllers/posController.js';

const router = Router();

/* Rutas para la gestión del punto de venta y registro de pedidos */
router.get('/sections', authenticate, authorize('REGISTRAR_PEDIDO'), listSectionsWithTablesHandler);
router.get('/next-sale-number', authenticate, authorize('REGISTRAR_PEDIDO'), getNextSaleNumberHandler);
router.post('/orders', authenticate, authorize('REGISTRAR_PEDIDO'), createOrderHandler);
router.get('/orders/:id/ticket', authenticate, authorize('REGISTRAR_PEDIDO'), getOrderTicketHandler);
router.get('/orders/:id/kitchen-ticket', authenticate, authorize('REGISTRAR_PEDIDO'), getKitchenTicketHandler);
router.post('/orders/:id/checkout', authenticate, authorize('REGISTRAR_PEDIDO'), checkoutOrderHandler);
router.get('/tables/:idSeccion/:idMesa/pending-batches', authenticate, authorize('REGISTRAR_PEDIDO'), listPendingBatchesHandler);
router.get('/tables/:idSeccion/:idMesa/latest-order', authenticate, authorize('REGISTRAR_PEDIDO'), getLatestOrderIdHandler);
router.get('/tables/:idSeccion/:idMesa/unmarked-count', authenticate, authorize('REGISTRAR_PEDIDO'), getUnmarkedCountHandler);
router.get('/mark-cards', authenticate, authorize('REGISTRAR_PEDIDO'), getMarkCardsHandler);
router.put('/units/mark', authenticate, authorize('REGISTRAR_PEDIDO'), markUnitsHandler);
router.put('/units/mark-batch', authenticate, authorize('REGISTRAR_PEDIDO'), applyMarkChangesHandler);
router.get('/tax-link', authenticate, authorize('REGISTRAR_PEDIDO'), getTaxLinkForCajaHandler);
router.post('/verify-password', authenticate, authorize('REGISTRAR_PEDIDO'), verifyPasswordHandler);

export default router;