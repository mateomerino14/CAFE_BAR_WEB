import bcrypt from 'bcryptjs';

/* Genera un hash seguro de la contraseña utilizando bcrypt con un factor de costo de 10 */
export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};


/* Compara una contraseña en texto plano con su hash almacenado y determina si coinciden */
export const verifyPassword = async (plainPassword, passwordHash) => {
  if (!plainPassword || !passwordHash) {
    return false;
  }
  return bcrypt.compare(plainPassword, passwordHash);
};