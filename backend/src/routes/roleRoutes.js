import {Router} from 'express';
import {authenticate} from '../middlewares/authenticate.js';
import {authorize} from '../middlewares/authorize.js';
import {
  createRoleHandler,
  listRoleNamesHandler,
  listRoleOptionsHandler,
  listRolesHandler,
  getRolePermissionsHandler,
  updateRolePermissionsHandler
} from '../controllers/roleController.js';

const router = Router();

/* Rutas para la gestión de cargos y permisos de acceso */
router.post('/', authenticate, authorize('REGISTRAR_CARGOS'), createRoleHandler);
router.get('/names', authenticate, authorize('REGISTRAR_CARGOS'), listRoleNamesHandler);
router.get('/options', authenticate, listRoleOptionsHandler);
router.get('/', authenticate, authorize('MODIFICAR_CARGOS'), listRolesHandler);
router.get('/:id/permissions', authenticate, authorize('MODIFICAR_CARGOS'), getRolePermissionsHandler);
router.put('/:id/permissions', authenticate, authorize('MODIFICAR_CARGOS'), updateRolePermissionsHandler);

export default router;