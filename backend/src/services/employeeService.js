import { query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';
import { uploadPhoto } from '../utils/storage.js';

/* Obtiene los empleados activos mostrando únicamente los datos necesarios para el inicio de sesión */
export const listActiveEmployeesForLogin = async () => {
  const result = await query(
    `SELECT alias_emp, img_emp FROM empleado WHERE disponible_emp = true`
  );
  return result.rows;
};

/* Verifica si el alias proporcionado ya está registrado por otro empleado, sin distinguir entre mayúsculas y minúsculas */
const isAliasTaken = async (alias) => {
  const result = await query(
    `SELECT cod_emp FROM empleado WHERE alias_emp ILIKE $1 LIMIT 1`,
    [alias]
  );
  return Boolean(result.rows[0]);
};

/* Verifica si el correo electrónico ya está registrado por otro empleado, permitiendo excluir al empleado actual durante una edición */
const isEmailTaken = async (email, excludeCodEmp = null) => {
  if (!email) return false;
  const result = excludeCodEmp
    ? await query(`SELECT cod_emp FROM empleado WHERE correo_el_emp ILIKE $1 AND cod_emp != $2 LIMIT 1`, [email, excludeCodEmp])
    : await query(`SELECT cod_emp FROM empleado WHERE correo_el_emp ILIKE $1 LIMIT 1`, [email]);
  return Boolean(result.rows[0]);
};

/* Genera una URL de avatar predeterminado utilizando el nombre y apellido del empleado cuando no se proporciona una fotografía */
const buildDefaultAvatarUrl = (firstName, lastName) => {
  const name = encodeURIComponent(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${name}&background=3B82F6&color=fff&size=256`;
};

/* Valida la disponibilidad del alias y correo, procesa la fotografía, cifra la contraseña y registra un nuevo empleado en la base de datos */
export const createEmployee = async (fields, photoFile) => {
  const aliasTaken = await isAliasTaken(fields.aliasEmp);
  if (aliasTaken) throw new Error('DUPLICATE_ALIAS');
  const emailTaken = await isEmailTaken(fields.correoElEmp);
  if (emailTaken) throw new Error('DUPLICATE_EMAIL');
  const photoUrl = photoFile
    ? await uploadPhoto('employees', photoFile)
    : buildDefaultAvatarUrl(fields.nomEmp, fields.apellPatEmp);
  const passwordHash = await hashPassword(fields.contEmp);
  try {
    await query(
      `INSERT INTO empleado
        (alias_emp, cont_emp, ci_emp, nom_emp, apell_pat_emp, apell_mat_emp, num_cel_emp, direccion_emp, correo_el_emp, id_cargo, img_emp, disponible_emp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)`,
      [
        fields.aliasEmp, passwordHash, fields.ciEmp, fields.nomEmp, fields.apellPatEmp, fields.apellMatEmp,
        fields.numCelEmp, fields.direccionEmp, fields.correoElEmp || null, fields.idCargo, photoUrl
      ]
    );
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_ALIAS');
    throw error;
  }
};

/* Obtiene los nombres de los empleados activos y elimina los nombres duplicados para utilizarlos como opciones de búsqueda o selección */
export const listEmployeeNames = async () => {
  const result = await query(
    `SELECT nom_emp FROM empleado WHERE disponible_emp = true ORDER BY nom_emp`
  );
  return Array.from(new Set(result.rows.map((row) => row.nom_emp)));
};

/* Obtiene la información completa de los empleados activos, incluyendo sus datos personales, fotografía y cargo, permitiendo filtrar por nombre */
export const listEmployees = async (search) => {
  const baseQuery = `
    SELECT e.cod_emp, e.alias_emp, e.nom_emp, e.apell_pat_emp, e.apell_mat_emp, e.ci_emp, e.num_cel_emp,
           e.direccion_emp, e.correo_el_emp, e.img_emp, e.id_cargo, c.nom_carg
    FROM empleado e
    JOIN cargo c ON c.id_cargo = e.id_cargo
    WHERE e.disponible_emp = true
  `;
  const result = search
    ? await query(`${baseQuery} AND e.nom_emp ILIKE $1 ORDER BY e.nom_emp`, [`${search}%`])
    : await query(`${baseQuery} ORDER BY e.nom_emp`);
  return result.rows.map((row) => ({
    cod_emp: row.cod_emp,
    alias_emp: row.alias_emp,
    nom_emp: row.nom_emp,
    apell_pat_emp: row.apell_pat_emp,
    apell_mat_emp: row.apell_mat_emp,
    ci_emp: row.ci_emp,
    num_cel_emp: row.num_cel_emp,
    direccion_emp: row.direccion_emp,
    correo_el_emp: row.correo_el_emp,
    img_emp: row.img_emp,
    id_cargo: row.id_cargo,
    cargo: { nom_carg: row.nom_carg }
  }));
};

/* Obtiene todos los empleados independientemente de su disponibilidad, incluyendo sus datos básicos, fotografía y cargo, permitiendo filtrarlos por nombre */
export const listAllEmployeesStatus = async (search) => {
  const baseQuery = `
    SELECT e.cod_emp, e.alias_emp, e.nom_emp, e.apell_pat_emp, e.apell_mat_emp, e.disponible_emp, e.img_emp, c.nom_carg
    FROM empleado e
    JOIN cargo c ON c.id_cargo = e.id_cargo
  `;
  const result = search
    ? await query(`${baseQuery} WHERE e.nom_emp ILIKE $1 ORDER BY e.nom_emp`, [`${search}%`])
    : await query(`${baseQuery} ORDER BY e.nom_emp`);
  return result.rows.map((row) => ({
    cod_emp: row.cod_emp,
    alias_emp: row.alias_emp,
    nom_emp: row.nom_emp,
    apell_pat_emp: row.apell_pat_emp,
    apell_mat_emp: row.apell_mat_emp,
    disponible_emp: row.disponible_emp,
    img_emp: row.img_emp,
    cargo: { nom_carg: row.nom_carg }
  }));
};

/* Actualiza los datos de un empleado, valida que el correo no esté duplicado y reemplaza su fotografía cuando se proporciona una nueva */
export const updateEmployee = async (codEmp, fields, photoFile) => {
  const emailTaken = await isEmailTaken(fields.correoElEmp, codEmp);
  if (emailTaken) throw new Error('DUPLICATE_EMAIL');
  let imgEmp = null;
  if (photoFile) {
    imgEmp = await uploadPhoto('employees', photoFile);
  }
  try {
    if (imgEmp) {
      await query(
        `UPDATE empleado SET nom_emp = $1, apell_pat_emp = $2, apell_mat_emp = $3, ci_emp = $4,
         num_cel_emp = $5, direccion_emp = $6, correo_el_emp = $7, id_cargo = $8, img_emp = $9
         WHERE cod_emp = $10`,
        [fields.nomEmp, fields.apellPatEmp, fields.apellMatEmp, fields.ciEmp, fields.numCelEmp,
         fields.direccionEmp, fields.correoElEmp || null, fields.idCargo, imgEmp, codEmp]
      );
    } else {
      await query(
        `UPDATE empleado SET nom_emp = $1, apell_pat_emp = $2, apell_mat_emp = $3, ci_emp = $4,
         num_cel_emp = $5, direccion_emp = $6, correo_el_emp = $7, id_cargo = $8
         WHERE cod_emp = $9`,
        [fields.nomEmp, fields.apellPatEmp, fields.apellMatEmp, fields.ciEmp, fields.numCelEmp,
         fields.direccionEmp, fields.correoElEmp || null, fields.idCargo, codEmp]
      );
    }
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_EMAIL');
    throw error;
  }
};

/* Genera un hash para la nueva contraseña y actualiza la contraseña del empleado indicado */
export const resetEmployeePassword = async (codEmp, newPassword) => {
  const passwordHash = await hashPassword(newPassword);
  await query(`UPDATE empleado SET cont_emp = $1 WHERE cod_emp = $2`, [passwordHash, codEmp]);
};

/* Actualiza el estado de disponibilidad de un empleado para habilitarlo o deshabilitarlo en el sistema */
export const setEmployeeAvailability = async (codEmp, available) => {
  await query(`UPDATE empleado SET disponible_emp = $1 WHERE cod_emp = $2`, [available, codEmp]);
};

/* Obtiene los nombres de todos los empleados, tanto activos como inactivos, y elimina los nombres duplicados */
export const listAllEmployeeNames = async () => {
  const result = await query(`SELECT nom_emp FROM empleado ORDER BY nom_emp`);
  return Array.from(new Set(result.rows.map((row) => row.nom_emp)));
};

/* Obtiene los empleados activos con los datos necesarios para ser utilizados en el punto de venta, ordenándolos por alias */
export const listActiveEmployeesForPos = async () => {
  const result = await query(
    `SELECT cod_emp, alias_emp, img_emp FROM empleado WHERE disponible_emp = true ORDER BY alias_emp`
  );
  return result.rows;
};
