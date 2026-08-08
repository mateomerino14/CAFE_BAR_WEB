
/* Genera un código numérico aleatorio de seis dígitos para utilizarlo en el proceso de recuperación de contraseña. */
export const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};