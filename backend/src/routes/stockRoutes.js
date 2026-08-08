import {Router} from 'express';
import {authenticate} from '../middlewares/authenticate.js';
import {authorize} from '../middlewares/authorize.js';
import {
  listStockOptionsHandler,
  createStockHandler,
  listStockNamesHandler,
  listStockHandler,
  getStockHandler,
  updateStockHandler
} from '../controllers/stockController.js';

const router = Router();

/* Rutas para la gestión de ingredientes e inventario del sistema */
router.get('/options', authenticate, listStockOptionsHandler);
router.post('/', authenticate, authorize('REGISTRAR_INGREDIENTES'), createStockHandler);
router.get('/names', authenticate, authorize('MODIFICAR_INGREDIENTES'), listStockNamesHandler);
router.get('/', authenticate, authorize('MODIFICAR_INGREDIENTES'), listStockHandler);
router.get('/:id', authenticate, authorize('MODIFICAR_INGREDIENTES'), getStockHandler);
router.put('/:id', authenticate, authorize('MODIFICAR_INGREDIENTES'), updateStockHandler);

export default router;