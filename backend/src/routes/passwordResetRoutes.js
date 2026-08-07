import { Router } from 'express';
import { requestResetHandler, verifyResetCodeHandler, resetPasswordHandler } from '../controllers/passwordResetController.js';

const router = Router();

/* Rutas para la recuperación y restablecimiento de contraseñas */
router.post('/request', requestResetHandler);
router.post('/verify', verifyResetCodeHandler);
router.post('/reset', resetPasswordHandler);

export default router;