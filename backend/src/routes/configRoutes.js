import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getTaxLinkHandler, updateTaxLinkHandler, changeDirectorioPasswordHandler,getDailySalesSummaryHandler,listDailySalesHandler,getDailySaleDetailsHandler, listCajeroNamesHandler,getPrintAgentUrlHandler,updatePrintAgentUrlHandler} from '../controllers/configController.js';

const router = Router();

/* Rutas para la configuración del sistema y consultas administrativas */
router.get('/tax-link', authenticate, authorize('CONFIGURACION'), getTaxLinkHandler);
router.put('/tax-link', authenticate, authorize('CONFIGURACION'), updateTaxLinkHandler);
router.put('/directorio-password', authenticate, authorize('CONFIGURACION'), changeDirectorioPasswordHandler);
router.get('/daily-sales/summary', authenticate, authorize('CONFIGURACION'), getDailySalesSummaryHandler);
router.get('/daily-sales', authenticate, authorize('CONFIGURACION'), listDailySalesHandler);
router.get('/daily-sales/:idVenta/details', authenticate, authorize('CONFIGURACION'), getDailySaleDetailsHandler);
router.get('/daily-sales/cajeros', authenticate, authorize('CONFIGURACION'), listCajeroNamesHandler);
router.get('/print-agent-url', authenticate, authorize('CONFIGURACION'), getPrintAgentUrlHandler);
router.put('/print-agent-url', authenticate, authorize('CONFIGURACION'), updatePrintAgentUrlHandler);

export default router;