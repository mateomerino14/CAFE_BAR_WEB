import pg from 'pg';

const { Pool } = pg;

/* Conexión a la base de datos Postgres (local, embebida por Electron o instalada aparte). */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'cafebar'
});

/* Ejecuta una consulta SQL parametrizada contra la base de datos. */
export const query = (text, params) => pool.query(text, params);
