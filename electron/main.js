import { app, BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { startEmbeddedPostgres, stopEmbeddedPostgres } from './postgres-embebido.js';
import { runMigrations } from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Carga (o genera la primera vez) las claves y credenciales que necesita el backend, guardándolas
   en la carpeta de datos del usuario para que sobrevivan entre reinicios de la app. */
const loadOrCreateAppConfig = () => {
  const configPath = path.join(app.getPath('userData'), 'app-config.json');

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  const config = {
    JWT_SECRET: randomBytes(32).toString('hex'),
    BREVO_API_KEY: '',
    BREVO_SENDER_EMAIL: '',
    BREVO_SENDER_NAME: 'Cafebar',
    ALLOWED_IPS: ''
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
};

/* Crea la ventana principal, cargando el frontend ya compilado (npm run build en frontend/). */
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(process.resourcesPath, 'frontend', 'dist', 'index.html');
    win.loadFile(indexPath);
  }
};

/* Secuencia de arranque: base de datos embebida, migraciones (solo la primera vez), backend, y recién ahí la ventana. */
const startApp = async () => {
  const config = loadOrCreateAppConfig();
  process.env.JWT_SECRET = config.JWT_SECRET;
  process.env.BREVO_API_KEY = config.BREVO_API_KEY;
  process.env.BREVO_SENDER_EMAIL = config.BREVO_SENDER_EMAIL;
  process.env.BREVO_SENDER_NAME = config.BREVO_SENDER_NAME;
  process.env.ALLOWED_IPS = config.ALLOWED_IPS;
  process.env.UPLOADS_DIR = path.join(app.getPath('userData'), 'uploads');
  process.env.UPLOADS_PUBLIC_URL = 'http://localhost:3000/uploads';

  const { isFirstRun } = await startEmbeddedPostgres();

  if (isFirstRun) {
    console.log('Primera vez que arranca la app: creando la base de datos...');
    await runMigrations();
  }

  const backendPath = app.isPackaged
    ? path.join(process.resourcesPath, 'backend', 'index.js')
    : path.join(__dirname, '..', 'backend', 'index.js');
  const { startServer } = await import(`file://${backendPath}`);
  await startServer();

  createWindow();
};

app.whenReady().then(startApp);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', async () => {
  await stopEmbeddedPostgres();
});
