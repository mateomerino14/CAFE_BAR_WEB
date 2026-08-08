import { supabase } from '../config/supabaseClient.js';
import { hashPassword } from '../utils/password.js';
import { uploadPhoto } from '../utils/storage.js';


/* Obtiene los empleados activos mostrando únicamente los datos necesarios para el inicio de sesión. */
export const listActiveEmployeesForLogin = async () => {
  const {data, error} = await supabase
    .from('empleado')
    .select('alias_emp, img_emp')
    .eq('disponible_emp', true);
  if (error) throw error;
  return data;
};


/* Verifica si el alias proporcionado ya está registrado por otro empleado, sin distinguir entre mayúsculas y minúsculas. */
const isAliasTaken = async (alias) => {
  const {data} = await supabase.from('empleado').select('cod_emp').ilike('alias_emp', alias).maybeSingle();
  return Boolean(data);
};


/* Verifica si el correo electrónico ya está registrado por otro empleado, permitiendo excluir al empleado actual durante una edición. */
const isEmailTaken = async (email, excludeCodEmp = null) => {
  if (!email) {
    return false;
  }
  let query = supabase.from('empleado').select('cod_emp').ilike('correo_el_emp', email);
  if (excludeCodEmp) query = query.neq('cod_emp', excludeCodEmp);
  const {data} = await query.maybeSingle();
  return Boolean(data);
};


/* Genera una URL de avatar predeterminado utilizando el nombre y apellido del empleado cuando no se proporciona una fotografía. */
const buildDefaultAvatarUrl = (firstName, lastName) => {
  const name = encodeURIComponent(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${name}&background=3B82F6&color=fff&size=256`;
};


/* Valida la disponibilidad del alias y correo, procesa la fotografía, cifra la contraseña y registra un nuevo empleado en la base de datos. */
export const createEmployee = async (fields, photoFile) => {
  const aliasTaken = await isAliasTaken(fields.aliasEmp);
  if (aliasTaken) throw new Error('DUPLICATE_ALIAS');
  const emailTaken = await isEmailTaken(fields.correoElEmp);
  if (emailTaken) throw new Error('DUPLICATE_EMAIL');
  const photoUrl = photoFile
    ? await uploadPhoto('employees', photoFile)
    : buildDefaultAvatarUrl(fields.nomEmp, fields.apellPatEmp);
  const passwordHash = await hashPassword(fields.contEmp);
  const {error} = await supabase.from('empleado').insert({
    alias_emp: fields.aliasEmp,
    cont_emp: passwordHash,
    ci_emp: fields.ciEmp,
    nom_emp: fields.nomEmp,
    apell_pat_emp: fields.apellPatEmp,
    apell_mat_emp: fields.apellMatEmp,
    num_cel_emp: fields.numCelEmp,
    direccion_emp: fields.direccionEmp,
    correo_el_emp: fields.correoElEmp || null,
    id_cargo: fields.idCargo,
    img_emp: photoUrl,
    disponible_emp: true
  });
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_ALIAS');
    throw error;
  }
};


/* Obtiene los nombres de los empleados activos y elimina los nombres duplicados para utilizarlos como opciones de búsqueda o selección. */
export const listEmployeeNames = async () => {
  const {data} = await supabase
    .from('empleado')
    .select('nom_emp')
    .eq('disponible_emp', true)
    .order('nom_emp');
  return Array.from(new Set((data || []).map((row) => row.nom_emp)));
};


/* Obtiene la información completa de los empleados activos, incluyendo sus datos personales, fotografía y cargo, permitiendo filtrar por nombre. */
export const listEmployees = async (search) => {
  let query = supabase
    .from('empleado')
    .select('cod_emp, alias_emp, nom_emp, apell_pat_emp, apell_mat_emp, ci_emp, num_cel_emp, direccion_emp, correo_el_emp, img_emp, id_cargo, cargo:cargo(nom_carg)')
    .eq('disponible_emp', true)
    .order('nom_emp');
  if (search) query = query.ilike('nom_emp', `${search}%`);
  const {data} = await query;
  return data || [];
};


/* Obtiene todos los empleados independientemente de su disponibilidad, incluyendo sus datos básicos, fotografía y cargo, permitiendo filtrarlos por nombre. */
export const listAllEmployeesStatus = async (search) => {
  let query = supabase
    .from('empleado')
    .select('cod_emp, alias_emp, nom_emp, apell_pat_emp, apell_mat_emp, disponible_emp, img_emp, cargo:cargo(nom_carg)')
    .order('nom_emp');
  if (search) query = query.ilike('nom_emp', `${search}%`);
  const {data} = await query;
  return data || [];
};


/* Actualiza los datos de un empleado, valida que el correo no esté duplicado y reemplaza su fotografía cuando se proporciona una nueva. */
export const updateEmployee = async (codEmp, fields, photoFile) => {
  const emailTaken = await isEmailTaken(fields.correoElEmp, codEmp);
  if (emailTaken) throw new Error('DUPLICATE_EMAIL');
  const updatePayload = {
    nom_emp: fields.nomEmp,
    apell_pat_emp: fields.apellPatEmp,
    apell_mat_emp: fields.apellMatEmp,
    ci_emp: fields.ciEmp,
    num_cel_emp: fields.numCelEmp,
    direccion_emp: fields.direccionEmp,
    correo_el_emp: fields.correoElEmp || null,
    id_cargo: fields.idCargo
  };
  if (photoFile) {
    updatePayload.img_emp = await uploadPhoto('employees', photoFile);
  }
  const {error} = await supabase.from('empleado').update(updatePayload).eq('cod_emp', codEmp);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_EMAIL');
    throw error;
  }
};


/* Genera un hash para la nueva contraseña y actualiza la contraseña del empleado indicado. */
export const resetEmployeePassword = async (codEmp, newPassword) => {
  const passwordHash = await hashPassword(newPassword);
  const {error} = await supabase.from('empleado').update({ cont_emp: passwordHash }).eq('cod_emp', codEmp);
  if (error) throw error;
};


/* Actualiza el estado de disponibilidad de un empleado para habilitarlo o deshabilitarlo en el sistema. */
export const setEmployeeAvailability = async (codEmp, available) => {
  const {error} = await supabase.from('empleado').update({ disponible_emp: available }).eq('cod_emp', codEmp);
  if (error) throw error;
};


/* Obtiene los nombres de todos los empleados, tanto activos como inactivos, y elimina los nombres duplicados. */
export const listAllEmployeeNames = async () => {
  const {data} = await supabase
    .from('empleado')
    .select('nom_emp')
    .order('nom_emp');
  return Array.from(new Set((data || []).map((row) => row.nom_emp)));
};


/* Obtiene los empleados activos con los datos necesarios para ser utilizados en el punto de venta, ordenándolos por alias. */
export const listActiveEmployeesForPos = async () => {
  const {data, error} = await supabase
    .from('empleado')
    .select('cod_emp, alias_emp, img_emp')
    .eq('disponible_emp', true)
    .order('alias_emp');
  if (error) throw error;
  return data;
};