import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getSystemConfigHandler, updateSystemConfigHandler } from '../controllers/systemConfigController.js';

const router = Router();

router.get('/', authenticate, authorize('CONFIGURACION'), getSystemConfigHandler);
router.put('/', authenticate, authorize('CONFIGURACION'), updateSystemConfigHandler);

export default router;
