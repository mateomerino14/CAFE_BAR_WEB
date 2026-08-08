import {verifyToken} from '../utils/token.js';

/* Normaliza una dirección IP para unificar formatos IPv4 e IPv6 equivalentes. */
const normalizeIp = (ip) => {
  if (!ip) {
    return ip;
  }
  if (ip === '::1') {
    return '127.0.0.1';
  }
  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }
  return ip;
};

/* Obtiene y procesa la lista de direcciones IP permitidas desde las variables de entorno. */
const getAllowedEntries = () => {
  const raw = process.env.ALLOWED_IPS || '';
  return raw.split(',').map((entry) => entry.trim()).filter(Boolean);
};

/* Verifica si la solicitud pertenece a un usuario DIRECTORIO mediante su token de autenticación. */
const isDirectorioRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    return decoded?.isDirectorio === true;
  } 
  catch {
    return false;
  }
};

/* Restringe el acceso según las IP permitidas, permitiendo el login y las solicitudes de usuarios DIRECTORIO. */
export const restrictByIp = (req, res, next) => {
  const allowedEntries = getAllowedEntries();
  if (allowedEntries.length === 0) {
    return next();
  }
  if (req.method === 'POST' && req.path === '/api/auth/login') {
    return next();
  }
  if (isDirectorioRequest(req)) {
    return next();
  }
  const requestIp = normalizeIp(req.ip);
  const isAllowed = allowedEntries.some((entry) => normalizeIp(entry) === requestIp);
  if (isAllowed) {
    return next();
  }
  return res.status(403).json({message: 'Acceso no permitido desde esta red'});
};