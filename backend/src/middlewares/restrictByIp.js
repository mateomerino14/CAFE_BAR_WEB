import { verifyToken } from '../utils/token.js';

const normalizeIp = (ip) => {
  if (!ip) return ip;
  if (ip === '::1') return '127.0.0.1';
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
};

const getAllowedEntries = () => {
  const raw = process.env.ALLOWED_IPS || '';
  return raw.split(',').map((entry) => entry.trim()).filter(Boolean);
};

const isDirectorioRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    return decoded?.isDirectorio === true;
  } catch {
    return false;
  }
};

export const restrictByIp = (req, res, next) => {
  const allowedEntries = getAllowedEntries();

  // Si no hay ninguna IP configurada, no se restringe nada
  if (allowedEntries.length === 0) {
    return next();
  }

  // El login queda siempre abierto para cualquiera: no expone datos,
  // solo valida credenciales. La restricción real se aplica después,
  // en cada petición ya autenticada.
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    return next();
  }

  // DIRECTORIO se salta la restricción de IP en todo lo demás
  if (isDirectorioRequest(req)) {
    return next();
  }

  const requestIp = normalizeIp(req.ip);
  const isAllowed = allowedEntries.some((entry) => normalizeIp(entry) === requestIp);

  if (isAllowed) {
    return next();
  }

  return res.status(403).json({ message: 'Acceso no permitido desde esta red' });
};