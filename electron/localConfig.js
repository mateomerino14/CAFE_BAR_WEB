import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { app } from 'electron';

/* Obtiene (o genera, la primera vez) valores de configuración que deben persistir entre reinicios de la app,
   como la clave secreta usada para firmar las sesiones (JWT_SECRET), guardados en un archivo local privado. */
export const getOrCreateLocalConfig = () => {
  const configPath = path.join(app.getPath('userData'), 'config.json');

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  const config = {
    jwtSecret: crypto.randomBytes(32).toString('hex')
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
};
