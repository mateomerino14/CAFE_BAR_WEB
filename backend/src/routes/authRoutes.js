import {Router} from 'express';
import {loginHandler, directorioAliasHandler} from '../controllers/authController.js';

const router = Router();

/* Rutas de autenticación */
router.post('/login', loginHandler);
router.get('/directorio-alias', directorioAliasHandler);

export default router;