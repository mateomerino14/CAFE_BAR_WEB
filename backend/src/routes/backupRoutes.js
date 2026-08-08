import {Router} from 'express';
import multer from 'multer';
import {authenticate} from '../middlewares/authenticate.js';
import {authorize} from '../middlewares/authorize.js';
import {exportBackupHandler, importBackupHandler, sendBackupEmailHandler} from '../controllers/backupController.js';

const upload = multer({storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 }});

const router = Router();

/* Rutas para la gestión de respaldos de la base de datos */
router.get('/export', authenticate, authorize('CONFIGURACION'), exportBackupHandler);
router.post('/import', authenticate, authorize('CONFIGURACION'), upload.single('archivo'), importBackupHandler);
router.post('/send-email', authenticate, authorize('CONFIGURACION'), sendBackupEmailHandler);

export default router;