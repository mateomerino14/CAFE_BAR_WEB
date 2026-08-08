import {Router} from 'express';
import {authenticate} from '../middlewares/authenticate.js';
import {getScreensTreeHandler} from '../controllers/screenController.js';

const router = Router();

/* Rutas para obtener las pantallas del sistema */
router.get('/tree', authenticate, getScreensTreeHandler);

export default router;