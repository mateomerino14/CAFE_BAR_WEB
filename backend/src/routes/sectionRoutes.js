import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { createSectionHandler, listSectionsHandler, getSectionTableCountHandler, updateSectionHandler } from '../controllers/sectionController.js';

const router = Router();

/* Rutas para la gestión de secciones y mesas del sistema */
router.post('/', authenticate, authorize('ADMIN_SECCIONES'), createSectionHandler);
router.get('/', authenticate, authorize('ADMIN_SECCIONES'), listSectionsHandler);
router.get('/:id/tables-count', authenticate, authorize('ADMIN_SECCIONES'), getSectionTableCountHandler);
router.put('/:id', authenticate, authorize('ADMIN_SECCIONES'), updateSectionHandler);

export default router;