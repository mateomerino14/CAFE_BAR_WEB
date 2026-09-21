import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { app } from 'electron';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* database/ y backend/ viven junto a electron/ mientras se desarrolla, pero una vez empaquetado
   con electron-builder quedan en un lugar distinto (resources/database, resources/backend) —
   no son carpetas "hermanas" de electron/ en ese caso. Por eso se calcula distinto según el modo. */
const databaseDir = app.isPackaged ? path.join(process.resourcesPath, 'database') : path.join(__dirname, '..', 'database');
const backendDir = app.isPackaged ? path.join(process.resourcesPath, 'backend') : path.join(__dirname, '..', 'backend');

/* Orden de ejecución de los scripts SQL, igual al documentado en database/README.md */
const SQL_FILES_IN_ORDER = [
  'schema.sql',
  'index.sql',
  'triggers.sql',
  'permits.sql',
  'data population.sql',
  'functions backups.sql'
];

/* Contraseña por defecto del usuario DIRECTORIO al instalar por primera vez.
   Se le indica al dueño del negocio que la cambie de inmediato desde Configuración. */
const DEFAULT_DIRECTORIO_PASSWORD = 'cafebar2026';

/* Corre, en orden, todos los scripts SQL de la base de datos contra el Postgres embebido recién creado,
   y crea el usuario DIRECTORIO con una contraseña por defecto. Solo debe llamarse la primera vez que arranca la app. */
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
