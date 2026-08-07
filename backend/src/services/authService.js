import {supabase} from '../config/supabaseClient.js';
import {verifyPassword} from '../utils/password.js';

/* Permisos asignados directamente al usuario DIRECTORIO */
const DIRECTORIO_PERMISSIONS = [
  'Home', 'Familia', 'Caja', 'Administracion', 'Productos', 'Secciones', 'Stock', 'Promociones', 'Empleados', 'Reportes', 'REGISTRAR_PEDIDO', 'CONFIGURACION', 'VER_REPORTES'
];

/* Obtiene los permisos asignados a un cargo de empleado */
export const loadEmployeePermissions = async (idCargo) => {
  const {data: screenPermissions} = await supabase
    .from('permisos_cargo')
    .select('pantalla:pantalla(nom_pant)')
    .eq('id_carg', idCargo);
  const {data: subscreenPermissions} = await supabase
    .from('permisos_cargo_subpantalla')
    .select('subpantalla:subpantalla(accion)')
    .eq('id_carg', idCargo);
  const screenNames = (screenPermissions || [])
    .map((row) => row.pantalla?.nom_pant)
    .filter(Boolean);
  const actionNames = (subscreenPermissions || [])
    .map((row) => row.subpantalla?.accion)
    .filter(Boolean);
  const permissions = Array.from(new Set([...screenNames, ...actionNames]));
  if (!permissions.includes('Home')){
    permissions.push('Home');
  }
  return permissions;
};

/* Autentica al usuario DIRECTORIO mediante su contraseña */
export const authenticateDirectorio = async (password) => {
  const {data: directorio} = await supabase
    .from('directorio')
    .select('id_admin, nom_admin, contrasena_admin')
    .limit(1)
    .maybeSingle();
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
  const {data: employee} = await supabase
    .from('empleado')
    .select('cod_emp, alias_emp, cont_emp, id_cargo, disponible_emp')
    .eq('alias_emp', alias)
    .eq('disponible_emp', true)
    .maybeSingle();
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
  const {data} = await supabase
    .from('directorio')
    .select('nom_admin')
    .limit(1)
    .maybeSingle();
  return data?.nom_admin || null;
};