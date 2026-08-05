import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getScreensTreeHandler } from '../controllers/screenController.js';

const router = Router();

router.get('/tree', authenticate, getScreensTreeHandler);

export default router;