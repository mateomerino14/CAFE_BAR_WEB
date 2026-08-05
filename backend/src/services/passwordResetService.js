import { supabase } from '../config/supabaseClient.js';
import { hashPassword } from '../utils/password.js';
import { generateResetCode } from '../utils/code.js';
import { sendResetCodeEmail } from './emailService.js';

const CODE_TTL_MINUTES = 10;

const isCodeActive = async (code) => {
  const { data } = await supabase
    .from('password_reset_codes')
    .select('id_reset')
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  return Boolean(data);
};

const generateUniqueActiveCode = async () => {
  let code = generateResetCode();
  while (await isCodeActive(code)) {
    code = generateResetCode();
  }
  return code;
};

const invalidatePreviousCodes = async (codEmp) => {
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('cod_emp', codEmp)
    .eq('used', false);
};

export const requestPasswordReset = async (email) => {
  const { data: employee } = await supabase
    .from('empleado')
    .select('cod_emp, nom_emp, correo_el_emp, disponible_emp')
    .eq('correo_el_emp', email)
    .eq('disponible_emp', true)
    .maybeSingle();
  if (!employee) return { found: false };
  await invalidatePreviousCodes(employee.cod_emp);
  const code = await generateUniqueActiveCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();
  await supabase
    .from('password_reset_codes')
    .insert({ cod_emp: employee.cod_emp, code, expires_at: expiresAt });
  await sendResetCodeEmail(employee.correo_el_emp, employee.nom_emp, code);
  return { found: true };
};

const findValidCode = async (email, code) => {
  const { data: employee } = await supabase
    .from('empleado')
    .select('cod_emp')
    .eq('correo_el_emp', email)
    .eq('disponible_emp', true)
    .maybeSingle();
  if (!employee) return null;
  const { data: reset } = await supabase
    .from('password_reset_codes')
    .select('id_reset, expires_at, used, cod_emp')
    .eq('cod_emp', employee.cod_emp)
    .eq('code', code)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!reset || reset.used) return null;
  if (new Date(reset.expires_at) < new Date()) return null;
  return reset;
};

export const verifyResetCode = async (email, code) => {
  const reset = await findValidCode(email, code);
  return Boolean(reset);
};

export const resetPassword = async (email, code, newPassword) => {
  const reset = await findValidCode(email, code);
  if (!reset) return false;
  const passwordHash = await hashPassword(newPassword);
  await supabase
    .from('empleado')
    .update({ cont_emp: passwordHash })
    .eq('cod_emp', reset.cod_emp);
  await supabase
    .from('password_reset_codes')
    .update({ used: true })
    .eq('id_reset', reset.id_reset);
  return true;
};