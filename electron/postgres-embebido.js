import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';
import {app} from 'electron';

let pg;

/* Inicia o inicializa el Postgres embebido y detecta el primer inicio */
export const startEmbeddedPostgres = async () => {
  const dataDir = path.join(app.getPath('userData'), 'postgres-data');
  const isFirstRun = !fs.existsSync(dataDir);
  pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    persistent: true
  });
  if (isFirstRun) {
    await pg.initialise();
  }
  await pg.start();
  if (isFirstRun) {
    await pg.createDatabase('cafebar');
  }
  return { isFirstRun };
};

/* Detiene el Postgres embebido de forma ordenada al cerrar la aplicación */
export const stopEmbeddedPostgres = async () => {
  if (pg) await pg.stop();
};
