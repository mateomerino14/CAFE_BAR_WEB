import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import {restrictByIp} from './src/middlewares/restrictByIp.js';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);


/* Define los orígenes autorizados para permitir solicitudes mediante CORS. */
const allowedOrigins = [
  'http://localhost:5173',
  'https://cafe-bar-web.vercel.app'
];


/* Configura CORS para permitir únicamente solicitudes provenientes de los orígenes autorizados. */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } 
    else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));


/* Habilita el procesamiento de solicitudes con datos en formato JSON y aplica el control de acceso por dirección IP. */
app.use(express.json());
app.use(restrictByIp);

/* Define una ruta de comprobación para verificar que el servidor se encuentre funcionando correctamente. */
app.get('/api/health', (req, res) => {
  res.json({status: 'ok', message: 'Servidor del Café Bar corriendo correctamente y conectado a Supabase'});
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



app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});