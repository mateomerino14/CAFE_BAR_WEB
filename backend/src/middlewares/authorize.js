
/* Middleware para validar los permisos de acceso del usuario a una funcionalidad */
export const authorize = (requiredPermission) => (req, res, next) => {
  if (req.user?.isDirectorio) {
    return next();
  }
  if (req.user?.permissions?.includes(requiredPermission)) {
    return next();
  }
  return res.status(403).json({message: 'No tiene permisos para realizar esta acción'});
};