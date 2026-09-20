import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/authRoutes.js';
import employeeRoutes from './src/routes/employeeRoutes.js';
import passwordResetRoutes from './src/routes/passwordResetRoutes.js';
import screenRoutes from './src/routes/screenRoutes.js';
import roleRoutes from './src/routes/roleRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import subcategoryRoutes from './src/routes/subcategoryRoutes.js';
import stockRoutes from './src/routes/stockRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import sectionRoutes from './src/routes/sectionRoutes.js';
import promotionRoutes from './src/routes/promotionRoutes.js';
import deletionRoutes from './src/routes/deletionRoutes.js';
import configRoutes from './src/routes/configRoutes.js';
import backupRoutes from './src/routes/backupRoutes.js';
import posRoutes from './src/routes/posRoutes.js';
import reportsRoutes from './src/routes/reportsRoutes.js';
import printerRoutes from './src/routes/printerRoutes.js';
import systemConfigRoutes from './src/routes/systemConfigRoutes.js';
import { restrictByIp } from './src/middlewares/restrictByIp.js';
import { startCronJobs } from './src/cronJobs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

/* En la versión de escritorio, el backend solo es alcanzable dentro de la red local del negocio
   (nunca expuesto a internet), así que se permite cualquier origen sin restricción de dominio. */
app.use(cors());

/* Habilita el procesamiento de solicitudes con datos en formato JSON y aplica el control de acceso por dirección IP (opcional, vacío por defecto). */
app.use(express.json());
app.use(restrictByIp);

/* Sirve las imágenes subidas (productos, empleados, categorías, etc.) como archivos estáticos accesibles desde la red local. */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* Sirve el frontend ya compilado (npm run build) desde el propio backend, para que todo el sistema
   funcione como un único servidor en un solo puerto, sin depender de ningún servidor de desarrollo aparte.
   FRONTEND_DIST_DIR permite indicar dónde está esa carpeta (por defecto, ../frontend/dist). */
const frontendDistDir = process.env.FRONTEND_DIST_DIR || path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDistDir));

/* Define una ruta de comprobación para verificar que el servidor se encuentre funcionando correctamente. */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del Café Bar corriendo correctamente (base de datos local)' });
});

/* Registra las rutas relacionadas con autenticación, empleados y recuperación de contraseñas. */
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/password-reset', passwordResetRoutes);

/* Registra las rutas relacionadas con pantallas, roles, categorías y subcategorías del sistema. */
app.use('/api/screens', screenRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);

/* Registra las rutas relacionadas con inventario, productos, secciones y promociones. */
app.use('/api/stock', stockRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/promotions', promotionRoutes);

/* Registra las rutas relacionadas con el punto de venta, configuración y gestión de eliminaciones. */
app.use('/api/pos', posRoutes);
app.use('/api/config', configRoutes);

/* Registra las rutas relacionadas con respaldos, eliminaciones fisicas y generación de reportes del sistema. */
app.use('/api/backup', backupRoutes);
app.use('/api/deletion', deletionRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/system-config', systemConfigRoutes);

/* Manejador de errores global: convierte errores de subida de archivos (Multer) y cualquier otro
   error no controlado en una respuesta JSON clara, en vez de dejar que Express devuelva HTML crudo
   que el frontend no puede interpretar. */
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'La imagen es demasiado grande (máximo 15MB)' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: 'Error al subir el archivo: ' + err.message });
  }
  console.error('Error no controlado:', err);
  return res.status(500).json({ message: 'Ocurrió un error inesperado en el servidor' });
});

/* Cualquier ruta que no sea /api ni /uploads se responde con el index.html del frontend,
   para que las rutas internas de React Router (ej. /caja/registrar-pedido) funcionen
   correctamente incluso al recargar la página directamente en esa dirección. */
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(frontendDistDir, 'index.html'));
});

/* Arranca el servidor Express y el trabajo programado (cron) del reporte automático semanal.
   Escucha en 0.0.0.0 para que otros dispositivos de la red local (celulares, tablets) puedan conectarse. */
export const startServer = () => {
  return new Promise((resolve) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor backend escuchando en http://0.0.0.0:${PORT}`);
      startCronJobs();
      resolve(server);
    });
  });
};

/* Si este archivo se ejecuta directamente (node index.js), arranca el servidor de inmediato.
   Cuando lo arranca Electron, en cambio, se importa startServer() y se llama desde ahí. */
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  startServer();
}
