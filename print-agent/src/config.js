import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const DEFAULT_CONFIG = {ticketPrinter: '', cocinaPrinter: ''};

/* Lee la configuración guardada o devuelve la configuración predeterminada si ocurre algún error. */
export const readConfig = () => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return {...DEFAULT_CONFIG, ...JSON.parse(raw)};
  } 
  catch {
    return DEFAULT_CONFIG;
  }
};

/* Guarda la configuración actual en el archivo config.json. */
export const writeConfig = (config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};