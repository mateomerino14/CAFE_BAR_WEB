import { Router } from 'express';
import { requestResetHandler, verifyResetCodeHandler, resetPasswordHandler } from '../controllers/passwordResetController.js';

const router = Router();

router.post('/request', requestResetHandler);
router.post('/verify', verifyResetCodeHandler);
router.post('/reset', resetPasswordHandler);

export default router;