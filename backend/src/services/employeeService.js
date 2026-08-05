import { supabase } from '../config/supabaseClient.js';
import { hashPassword } from '../utils/password.js';
import { uploadPhoto } from '../utils/storage.js';

export const listActiveEmployeesForLogin = async () => {
  const { data, error } = await supabase
    .from('empleado')
    .select('alias_emp, img_emp')
    .eq('disponible_emp', true);
  if (error) throw error;
  return data;
};

const isAliasTaken = async (alias) => {
  const { data } = await supabase.from('empleado').select('cod_emp').ilike('alias_emp', alias).maybeSingle();
  return Boolean(data);
};

const isEmailTaken = async (email, excludeCodEmp = null) => {
  if (!email) return false;
  let query = supabase.from('empleado').select('cod_emp').ilike('correo_el_emp', email);
  if (excludeCodEmp) query = query.neq('cod_emp', excludeCodEmp);
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

const buildDefaultAvatarUrl = (firstName, lastName) => {
  const name = encodeURIComponent(`${firstName} ${lastName}`);
  return `https://ui-avatars.com/api/?name=${name}&background=3B82F6&color=fff&size=256`;
};

export const createEmployee = async (fields, photoFile) => {
  const aliasTaken = await isAliasTaken(fields.aliasEmp);
  if (aliasTaken) throw new Error('DUPLICATE_ALIAS');
  const emailTaken = await isEmailTaken(fields.correoElEmp);
  if (emailTaken) throw new Error('DUPLICATE_EMAIL');
  const photoUrl = photoFile
    ? await uploadPhoto('employees', photoFile)
    : buildDefaultAvatarUrl(fields.nomEmp, fields.apellPatEmp);
  const passwordHash = await hashPassword(fields.contEmp);
  const { error } = await supabase.from('empleado').insert({
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

export const listEmployeeNames = async () => {
  const { data } = await supabase
    .from('empleado')
    .select('nom_emp')
    .eq('disponible_emp', true)
    .order('nom_emp');

  return Array.from(new Set((data || []).map((row) => row.nom_emp)));
};

export const listEmployees = async (search) => {
  let query = supabase
    .from('empleado')
    .select('cod_emp, alias_emp, nom_emp, apell_pat_emp, apell_mat_emp, ci_emp, num_cel_emp, direccion_emp, correo_el_emp, img_emp, id_cargo, cargo:cargo(nom_carg)')
    .eq('disponible_emp', true)
    .order('nom_emp');
  if (search) query = query.ilike('nom_emp', `${search}%`);
  const { data } = await query;
  return data || [];
};

export const listAllEmployeesStatus = async (search) => {
  let query = supabase
    .from('empleado')
    .select('cod_emp, alias_emp, nom_emp, apell_pat_emp, apell_mat_emp, disponible_emp, img_emp, cargo:cargo(nom_carg)')
    .order('nom_emp');
  if (search) query = query.ilike('nom_emp', `${search}%`);
  const { data } = await query;
  return data || [];
};

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
  const { error } = await supabase.from('empleado').update(updatePayload).eq('cod_emp', codEmp);
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_EMAIL');
    throw error;
  }
};

export const resetEmployeePassword = async (codEmp, newPassword) => {
  const passwordHash = await hashPassword(newPassword);
  const { error } = await supabase.from('empleado').update({ cont_emp: passwordHash }).eq('cod_emp', codEmp);
  if (error) throw error;
};

export const setEmployeeAvailability = async (codEmp, available) => {
  const { error } = await supabase.from('empleado').update({ disponible_emp: available }).eq('cod_emp', codEmp);
  if (error) throw error;
};

export const listAllEmployeeNames = async () => {
  const { data } = await supabase
    .from('empleado')
    .select('nom_emp')
    .order('nom_emp');

  return Array.from(new Set((data || []).map((row) => row.nom_emp)));
};

export const listActiveEmployeesForPos = async () => {
  const { data, error } = await supabase
    .from('empleado')
    .select('cod_emp, alias_emp, img_emp')
    .eq('disponible_emp', true)
    .order('alias_emp');
  if (error) throw error;
  return data;
};