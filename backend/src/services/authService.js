import { query } from '../config/db.js';
import { verifyPassword } from '../utils/password.js';

/* Permisos asignados directamente al usuario DIRECTORIO */
const DIRECTORIO_PERMISSIONS = [
  'Home', 'Familia', 'Caja', 'Administracion', 'Productos', 'Secciones', 'Stock', 'Promociones', 'Empleados', 'Reportes', 'REGISTRAR_PEDIDO', 'CONFIGURACION', 'VER_REPORTES'
];

/* Obtiene los permisos asignados a un cargo de empleado */
export const loadEmployeePermissions = async (idCargo) => {
  const screenResult = await query(
    `SELECT p.nom_pant
     FROM permisos_cargo pc
     JOIN pantalla p ON p.id_pant = pc.id_pant
     WHERE pc.id_carg = $1`,
    [idCargo]
  );
  const subscreenResult = await query(
    `SELECT sp.accion
     FROM permisos_cargo_subpantalla pcs
     JOIN subpantalla sp ON sp.id_sub_pant = pcs.id_sub_pant
     WHERE pcs.id_carg = $1`,
    [idCargo]
  );

  const screenNames = screenResult.rows.map((row) => row.nom_pant).filter(Boolean);
  const actionNames = subscreenResult.rows.map((row) => row.accion).filter(Boolean);
  const permissions = Array.from(new Set([...screenNames, ...actionNames]));
  if (!permissions.includes('Home')) {
    permissions.push('Home');
  }
  return permissions;
};

/* Autentica al usuario DIRECTORIO mediante su contraseña */
export const authenticateDirectorio = async (password) => {
  const result = await query(
    `SELECT id_admin, nom_admin, contrasena_admin FROM directorio LIMIT 1`
  );
  const directorio = result.rows[0];
  if (!directorio) {
    return null;
  }
  const isValid = await verifyPassword(password, directorio.contrasena_admin);
  if (!isValid) {
    return null;
  }
  return {
    isDirectorio: true,
    codEmp: null,
    alias: directorio.nom_admin,
    idCargo: null,
    permissions: DIRECTORIO_PERMISSIONS
  };
};

/* Autentica a un empleado mediante alias y contraseña */
export const authenticateEmployee = async (alias, password) => {
  const result = await query(
    `SELECT cod_emp, alias_emp, cont_emp, id_cargo, disponible_emp
     FROM empleado
     WHERE alias_emp = $1 AND disponible_emp = true`,
    [alias]
  );
  const employee = result.rows[0];
  if (!employee) {
    return null;
  }
  const isValid = await verifyPassword(password, employee.cont_emp);
  if (!isValid) {
    return null;
  }
  const permissions = await loadEmployeePermissions(employee.id_cargo);
  return {
    isDirectorio: false,
    codEmp: employee.cod_emp,
    alias: employee.alias_emp,
    idCargo: employee.id_cargo,
    permissions
  };
};

/* Gestiona el proceso de autenticación según el tipo de usuario */
export const login = async (username, password) => {
  if (username === 'DIRECTORIO') {
    return authenticateDirectorio(password);
  }
  return authenticateEmployee(username, password);
};

/* Obtiene el alias configurado del usuario DIRECTORIO */
export const getDirectorioAlias = async () => {
  const result = await query(`SELECT nom_admin FROM directorio LIMIT 1`);
  return result.rows[0]?.nom_admin || null;
};
