import {app, BrowserWindow, shell} from 'electron';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {randomBytes} from 'crypto';
import {startEmbeddedPostgres, stopEmbeddedPostgres} from './postgres-embebido.js';
import {runMigrations} from './migrate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Desactiva la aceleración GPU para mejorar la estabilidad en Windows */
app.disableHardwareAcceleration();

/* Carga o genera la clave secreta para las sesiones JWT */
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

/* Crea la ventana principal y carga el frontend */
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

  /* Abre los enlaces externos en el navegador del sistema */
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url === 'about:blank') {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  /* Registra errores del proceso de renderizado */
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

/* Inicia la base de datos, migraciones, backend y ventana */
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
