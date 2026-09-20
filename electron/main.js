import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { startEmbeddedPostgres, stopEmbeddedPostgres } from './postgres-embebido.js';
import { runMigrations } from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Desactiva la aceleración por GPU. Es la mitigación recomendada por el propio equipo de Electron
   para un problema conocido en Windows: al salir del modo reposo, el proceso de GPU a veces se cae
   y la ventana se recarga sola, perdiendo cualquier dato que no se haya guardado (como el carrito
   de Caja). Sacrifica algo de fluidez visual a cambio de mucha más estabilidad. */
app.disableHardwareAcceleration();

/* Carga (o genera la primera vez) la clave secreta para firmar sesiones (JWT), guardándola
   en la carpeta de datos del usuario para que sobreviva entre reinicios de la app.
   Las credenciales de Brevo y ALLOWED_IPS ya NO viven aquí — se guardan en la base de datos
   y se editan desde Configuración, para poder cambiarlas sin reiniciar la aplicación. */
const loadOrCreateAppConfig = () => {
  const configPath = path.join(app.getPath('userData'), 'app-config.json');

  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  const config = {
    JWT_SECRET: randomBytes(32).toString('hex')
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  return config;
};

/* Crea la ventana principal, cargando el frontend ya compilado (npm run build en frontend/).
   Cualquier enlace que la app intente abrir en una ventana nueva (target="_blank", TikTok,
   la página de impuestos, etc.) se manda al navegador normal de Windows en vez de abrir
   otra ventana de Electron. */
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

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  /* Registra en consola si el proceso de renderizado llega a caerse (diagnóstico, por si el
     problema de GPU al salir del reposo persiste incluso con la aceleración desactivada). */
  win.webContents.on('render-process-gone', (event, details) => {
    console.error('El proceso de renderizado se cayó:', details.reason);
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
