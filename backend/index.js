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

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del Café Bar corriendo correctamente y conectado a Supabase' });
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/config', configRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/deletion', deletionRoutes);
app.use('/api/reports', reportsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});