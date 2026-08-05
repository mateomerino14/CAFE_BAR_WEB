import { Router } from 'express';
import { loginHandler, directorioAliasHandler } from '../controllers/authController.js';

const router = Router();
router.post('/login', loginHandler);
router.get('/directorio-alias', directorioAliasHandler);

export default router;