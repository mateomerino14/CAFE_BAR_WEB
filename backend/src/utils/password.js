import bcrypt from 'bcryptjs';

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, 10);
};

export const verifyPassword = async (plainPassword, passwordHash) => {
  if (!plainPassword || !passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
};