import { query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';
import { generateResetCode } from '../utils/code.js';
import { sendResetCodeEmail } from './emailService.js';

/* Verifica si un código de recuperación existe, no ha sido utilizado y aún se encuentra dentro de su período de validez */
const isCodeActive = async (code) => {
  const result = await query(
    `SELECT id_reset FROM password_reset_codes WHERE code = $1 AND used = false AND expires_at > $2 LIMIT 1`,
    [code, new Date().toISOString()]
  );
  return Boolean(result.rows[0]);
};

/* Genera un código de recuperación y comprueba que no coincida con otro código activo antes de devolverlo */
const generateUniqueActiveCode = async () => {
  let code = generateResetCode();
  while (await isCodeActive(code)) {
    code = generateResetCode();
  }
  return code;
};

/* Invalida todos los códigos de recuperación anteriores que aún no hayan sido utilizados por el empleado indicado */
const invalidatePreviousCodes = async (codEmp) => {
  await query(
    `UPDATE password_reset_codes SET used = true WHERE cod_emp = $1 AND used = false`,
    [codEmp]
  );
};

/* Busca un empleado activo mediante su correo, invalida sus códigos anteriores, genera un nuevo código de recuperación, lo registra y lo envía por correo electrónico */
export const requestPasswordReset = async (email) => {
  const employeeResult = await query(
    `SELECT cod_emp, nom_emp, correo_el_emp, disponible_emp FROM empleado WHERE correo_el_emp = $1 AND disponible_emp = true`,
    [email]
  );
  const employee = employeeResult.rows[0];
  if (!employee) return { found: false };
  await invalidatePreviousCodes(employee.cod_emp);
  const code = await generateUniqueActiveCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await query(
    `INSERT INTO password_reset_codes (cod_emp, code, expires_at) VALUES ($1, $2, $3)`,
    [employee.cod_emp, code, expiresAt]
  );
  await sendResetCodeEmail(employee.correo_el_emp, employee.nom_emp, code);
  return { found: true };
};

/* Busca y valida el código de recuperación más reciente asociado al correo indicado, comprobando que exista, no haya sido utilizado y no haya expirado */
const findValidCode = async (email, code) => {
  const employeeResult = await query(
    `SELECT cod_emp FROM empleado WHERE correo_el_emp = $1 AND disponible_emp = true`,
    [email]
  );
  const employee = employeeResult.rows[0];
  if (!employee) return null;
  const resetResult = await query(
    `SELECT id_reset, expires_at, used, cod_emp FROM password_reset_codes
     WHERE cod_emp = $1 AND code = $2 ORDER BY created_at DESC LIMIT 1`,
    [employee.cod_emp, code]
  );
  const reset = resetResult.rows[0];
  if (!reset || reset.used) return null;
  if (new Date(reset.expires_at) < new Date()) return null;
  return reset;
};

/* Verifica si el código de recuperación proporcionado es válido y se encuentra vigente para el empleado asociado al correo */
export const verifyResetCode = async (email, code) => {
  const reset = await findValidCode(email, code);
  return Boolean(reset);
};

/* Valida el código de recuperación, actualiza la contraseña del empleado y marca el código utilizado para impedir su reutilización */
export const resetPassword = async (email, code, newPassword) => {
  const reset = await findValidCode(email, code);
  if (!reset) return false;
  const passwordHash = await hashPassword(newPassword);
  await query(`UPDATE empleado SET cont_emp = $1 WHERE cod_emp = $2`, [passwordHash, reset.cod_emp]);
  await query(`UPDATE password_reset_codes SET used = true WHERE id_reset = $1`, [reset.id_reset]);
  return true;
};
