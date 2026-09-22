import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {app} from 'electron';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Define las rutas de la base de datos y backend según el modo de ejecución */
const databaseDir = app.isPackaged ? path.join(process.resourcesPath, 'database') : path.join(__dirname, '..', 'database');
const backendDir = app.isPackaged ? path.join(process.resourcesPath, 'backend') : path.join(__dirname, '..', 'backend');

/* Define el orden de ejecución de los scripts SQL */
const SQL_FILES_IN_ORDER = [
  'schema.sql',
  'index.sql',
  'triggers.sql',
  'permits.sql',
  'data population.sql',
  'functions backups.sql'
];

/* Define la contraseña inicial del usuario DIRECTORIO */
const DEFAULT_DIRECTORIO_PASSWORD = 'cafebar2026';

/* Ejecuta los scripts SQL y crea el usuario DIRECTORIO en el primer inicio */
export const runMigrations = async () => {
  const client = new pg.Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'cafebar'
  });
  await client.connect();
  try {
    for (const fileName of SQL_FILES_IN_ORDER) {
      const filePath = path.join(databaseDir, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`No se encontró ${fileName}, se omite`);
        continue;
      }
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Ejecutando ${fileName}...`);
      await client.query(sql);
    }
    const backendUtilsPath = path.join(backendDir, 'src', 'utils', 'password.js');
    const { hashPassword } = await import(`file://${backendUtilsPath}`);
    const passwordHash = await hashPassword(DEFAULT_DIRECTORIO_PASSWORD);
    await client.query(
      `INSERT INTO directorio (nom_admin, contrasena_admin) VALUES ('DIRECTORIO', $1)`,
      [passwordHash]
    );
    console.log(`Usuario DIRECTORIO creado con contraseña por defecto: "${DEFAULT_DIRECTORIO_PASSWORD}" (cámbiala desde Configuración apenas ingreses).`);
    console.log('Migraciones completadas correctamente');
  } finally {
    await client.end();
  }
};
