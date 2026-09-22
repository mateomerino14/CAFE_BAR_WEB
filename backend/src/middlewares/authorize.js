
/* Middleware para validar los permisos de acceso del usuario. */
export const authorize = (requiredPermission) => (req, res, next) => {
  if (req.user?.isDirectorio) {
    return next();
  }
  const required = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
  const hasAny = required.some((permission) => req.user?.permissions?.includes(permission));
  if (hasAny) {
    return next();
  }
  return res.status(403).json({message: 'No tiene permisos para realizar esta acción'});
};