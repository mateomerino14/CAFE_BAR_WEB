import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { listDeletionDataHandler, getDependencyTreeHandler, executeDeletionHandler } from '../controllers/deletionController.js';

const router = Router();

/* Rutas para la gestión de eliminación y análisis de dependencias de datos */
router.get('/deletion-data', authenticate, authorize('CONFIGURACION'), listDeletionDataHandler);
router.post('/deletion-tree', authenticate, authorize('CONFIGURACION'), getDependencyTreeHandler);
router.post('/execute', authenticate, authorize('CONFIGURACION'), executeDeletionHandler);

export default router;