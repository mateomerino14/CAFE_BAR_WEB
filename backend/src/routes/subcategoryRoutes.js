import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../config/upload.js';
import { updateSubcategoryHandler, setSubcategoryAvailabilityHandler } from '../controllers/categoryController.js';

const router = Router();

router.put('/:id', authenticate, authorize('MODIFICAR_CATEGORIA'), upload.any(), updateSubcategoryHandler);
router.put('/:id/availability', authenticate, authorize('MODIFICAR_CATEGORIA'), setSubcategoryAvailabilityHandler);

export default router;