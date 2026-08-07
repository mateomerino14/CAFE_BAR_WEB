import {createRole, listRoleNames, listRoleOptions, listRoles, getRolePermissions, updateRolePermissions} from '../services/roleService.js';

/* Controlador para registrar un nuevo cargo con sus permisos */
export const createRoleHandler = async (req, res) => {
  const { nombre, subpantallaIds } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({message: 'Ingrese un nombre para el cargo'});
  }
  if (!Array.isArray(subpantallaIds) || subpantallaIds.length === 0) {
    return res.status(400).json({message: 'Se debe dar acceso por lo menos a una subsección'});
  }
  try {
    const idCargo = await createRole(nombre.trim(), subpantallaIds);
    return res.status(201).json({id_cargo: idCargo});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_NAME') {
      return res.status(409).json({message: 'Ya existe un cargo con ese nombre'});
    }
    return res.status(500).json({message: 'No se pudo registrar el cargo'});
  }
};

/* Controlador para listar los nombres de los cargos */
export const listRoleNamesHandler = async (req, res) => {
  try {
    const names = await listRoleNames();
    return res.json(names);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener los cargos'});
  }
};

/* Controlador para listar los cargos disponibles como opciones */
export const listRoleOptionsHandler = async (req, res) => {
  try {
    const options = await listRoleOptions();
    return res.json(options);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener los cargos'});
  }
};

/* Controlador para listar los cargos según el criterio de búsqueda */
export const listRolesHandler = async (req, res) => {
  const {search = ''} = req.query;
  try {
    const roles = await listRoles(search);
    return res.json(roles);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener los cargos'});
  }
};

/* Controlador para obtener los permisos asignados a un cargo */
export const getRolePermissionsHandler = async (req, res) => {
  try {
    const subpantallaIds = await getRolePermissions(req.params.id);
    return res.json({subpantallaIds});
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener los permisos del cargo'});
  }
};

/* Controlador para actualizar los permisos de un cargo */
export const updateRolePermissionsHandler = async (req, res) => {
  const {subpantallaIds} = req.body;
  try {
    await updateRolePermissions(req.params.id, subpantallaIds || []);
    return res.json({message: 'Se ha registrado con éxito la modificación'});
  } 
  catch (error) {
    if (error.message === 'EMPTY_PERMISSIONS') {
      return res.status(400).json({message: 'Se debe dar acceso por lo menos a una subsección'});
    }
    return res.status(500).json({message: 'No se pudo modificar el cargo'});
  }
};