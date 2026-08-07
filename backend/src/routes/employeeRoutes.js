import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';
import { upload } from '../config/upload.js';
import {
  loginListHandler,
  createEmployeeHandler,
  listEmployeeNamesHandler,
  listAllEmployeeNamesHandler,
  listEmployeesHandler,
  listAllEmployeesStatusHandler,
  updateEmployeeHandler,
  resetPasswordHandler,
  listEmployeesForPosHandler,
  setAvailabilityHandler
} from '../controllers/employeeController.js';

const router = Router();

/* Rutas para la gestión de empleados del sistema */
router.get('/login-list', loginListHandler);
router.post('/', authenticate, authorize('REGISTRAR_EMPLEADOS'), upload.single('photo'), createEmployeeHandler);
router.get('/names', authenticate, listEmployeeNamesHandler);
router.get('/names/all', authenticate, authorize('BAJA_EMPLEADOS'), listAllEmployeeNamesHandler);
router.get('/', authenticate, authorize('MODIFICAR_EMPLEADOS'), listEmployeesHandler);
router.get('/status', authenticate, authorize('BAJA_EMPLEADOS'), listAllEmployeesStatusHandler);
router.put('/:id', authenticate, authorize('MODIFICAR_EMPLEADOS'), upload.single('photo'), updateEmployeeHandler);
router.put('/:id/password', authenticate, authorize('MODIFICAR_EMPLEADOS'), resetPasswordHandler);
router.put('/:id/availability', authenticate, authorize('BAJA_EMPLEADOS'), setAvailabilityHandler);
router.get('/pos-list', authenticate, authorize('REGISTRAR_PEDIDO'), listEmployeesForPosHandler);

export default router;