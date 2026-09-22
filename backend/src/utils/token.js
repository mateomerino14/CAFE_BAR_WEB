import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

/* Genera un token JWT firmado con la información proporcionada y establece el tiempo de expiración configurado */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
};

/* Verifica la validez y firma del token JWT y devuelve la información contenida en su payload */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};