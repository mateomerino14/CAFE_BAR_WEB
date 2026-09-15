import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { listPrintersHandler, getPrinterAssignmentHandler, savePrinterAssignmentHandler, printOrderHandler } from '../controllers/printerController.js';

const router = Router();

/* Rutas para consultar impresoras disponibles, configurar su asignación e imprimir directamente. */
router.get('/', authenticate, listPrintersHandler);
router.get('/config', authenticate, getPrinterAssignmentHandler);
router.put('/config', authenticate, authorize('CONFIGURACION'), savePrinterAssignmentHandler);
router.post('/print', authenticate, printOrderHandler);

export default router;
