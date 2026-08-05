import {
  listActiveEmployeesForLogin,
  createEmployee,
  listEmployeeNames,
  listAllEmployeeNames,
  listEmployees,
  listAllEmployeesStatus,
  updateEmployee,
  resetEmployeePassword,
  listActiveEmployeesForPos,
  setEmployeeAvailability
} from '../services/employeeService.js';

import { isLettersOnly, isNumeric } from '../utils/validators.js';

export const loginListHandler = async (req, res) => {
  try {
    const employees = await listActiveEmployeesForLogin();
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Error al acceder a la base de datos' });
  }
};

const validatePersonalFields = (fields) => {
  if (!fields.nomEmp || !fields.apellPatEmp || !fields.apellMatEmp) {
    return 'Rellene los campos solicitados';
  }
  if (!isLettersOnly(fields.nomEmp) || !isLettersOnly(fields.apellPatEmp) || !isLettersOnly(fields.apellMatEmp)) {
    return 'Nombre y apellidos solo deben contener letras';
  }
  if (!isNumeric(fields.ciEmp) || fields.ciEmp.length < 5) {
    return 'La cédula de identidad debe tener al menos 5 dígitos';
  }
  if (!isNumeric(fields.numCelEmp) || fields.numCelEmp.length < 7) {
    return 'El número de celular debe tener al menos 7 dígitos';
  }
  if (!fields.direccionEmp) {
    return 'Ingrese una dirección';
  }
  if (!fields.idCargo) {
    return 'Seleccione un cargo';
  }
  return null;
};

export const createEmployeeHandler = async (req, res) => {
  const fields = req.body;
  const validationError = validatePersonalFields(fields);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  if (!fields.aliasEmp || fields.aliasEmp.trim().length < 4) {
    return res.status(400).json({ message: 'El alias debe tener al menos 4 caracteres' });
  }
  if (!fields.contEmp || fields.contEmp.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    await createEmployee(fields, req.file);
    return res.status(201).json({ message: 'Empleado registrado con éxito' });
  } catch (error) {
    if (error.message === 'DUPLICATE_ALIAS') {
      return res.status(409).json({ message: 'Ese alias ya está en uso' });
    }
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ message: 'Ese correo ya está registrado en otra cuenta' });
    }
    return res.status(500).json({ message: 'No se pudo registrar el empleado' });
  }
};

export const listEmployeeNamesHandler = async (req, res) => {
  try {
    const names = await listEmployeeNames();
    return res.json(names);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

export const listAllEmployeeNamesHandler = async (req, res) => {
  try {
    const names = await listAllEmployeeNames();
    return res.json(names);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

export const listEmployeesHandler = async (req, res) => {
  const { search = '' } = req.query;
  try {
    const employees = await listEmployees(search);
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

export const listAllEmployeesStatusHandler = async (req, res) => {
  const { search = '' } = req.query;
  try {
    const employees = await listAllEmployeesStatus(search);
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

export const updateEmployeeHandler = async (req, res) => {
  const fields = req.body;
  const validationError = validatePersonalFields(fields);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }
  try {
    await updateEmployee(req.params.id, fields, req.file);
    return res.json({ message: 'Se ha registrado con éxito la modificación' });
  } catch (error) {
    if (error.message === 'DUPLICATE_EMAIL') {
      return res.status(409).json({ message: 'Ese correo ya está registrado en otra cuenta' });
    }
    return res.status(500).json({ message: 'No se pudo modificar el empleado' });
  }
};

export const resetPasswordHandler = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    await resetEmployeePassword(req.params.id, newPassword);
    return res.json({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo restablecer la contraseña' });
  }
};

export const setAvailabilityHandler = async (req, res) => {
  const { available } = req.body;
  try {
    await setEmployeeAvailability(req.params.id, available);
    return res.json({ message: available ? 'Empleado habilitado' : 'Empleado deshabilitado' });
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo actualizar el estado del empleado' });
  }
};


export const listEmployeesForPosHandler = async (req, res) => {
  try {
    const employees = await listActiveEmployeesForPos();
    return res.json(employees);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

