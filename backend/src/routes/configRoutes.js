import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { getTaxLinkHandler, updateTaxLinkHandler, changeDirectorioPasswordHandler,getDailySalesSummaryHandler,listDailySalesHandler,getDailySaleDetailsHandler, listCajeroNamesHandler} from '../controllers/configController.js';

const router = Router();

router.get('/tax-link', authenticate, authorize('CONFIGURACION'), getTaxLinkHandler);
router.put('/tax-link', authenticate, authorize('CONFIGURACION'), updateTaxLinkHandler);
router.put('/directorio-password', authenticate, authorize('CONFIGURACION'), changeDirectorioPasswordHandler);
router.get('/daily-sales/summary', authenticate, authorize('CONFIGURACION'), getDailySalesSummaryHandler);
router.get('/daily-sales', authenticate, authorize('CONFIGURACION'), listDailySalesHandler);
router.get('/daily-sales/:idVenta/details', authenticate, authorize('CONFIGURACION'), getDailySaleDetailsHandler);
router.get('/daily-sales/cajeros', authenticate, authorize('CONFIGURACION'), listCajeroNamesHandler);

export default router;