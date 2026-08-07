import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import {
  listReportEmployeesHandler, getDetailedSalesReportHandler, getSummaryByDateReportHandler,
  getTopProductsReportHandler, getEmployeeChartReportHandler, getEmployeeSalesReportHandler,
  sendReportEmailHandler
} from '../controllers/reportsController.js';

const router = Router();

/* Rutas para la generación y gestión de reportes del sistema */
router.get('/employees', authenticate, authorize('VER_REPORTES'), listReportEmployeesHandler);
router.get('/detallado', authenticate, authorize('VER_REPORTES'), getDetailedSalesReportHandler);
router.get('/resumen-fechas', authenticate, authorize('VER_REPORTES'), getSummaryByDateReportHandler);
router.get('/productos-vendidos', authenticate, authorize('VER_REPORTES'), getTopProductsReportHandler);
router.get('/resumen-empleado', authenticate, authorize('VER_REPORTES'), getEmployeeChartReportHandler);
router.get('/venta-empleado', authenticate, authorize('VER_REPORTES'), getEmployeeSalesReportHandler);
router.post('/send-email', authenticate, authorize('VER_REPORTES'), sendReportEmailHandler);

export default router;