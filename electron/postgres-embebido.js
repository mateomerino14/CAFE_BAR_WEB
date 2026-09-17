import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import { app } from 'electron';

let pg;

/* Arranca (o inicializa la primera vez) el Postgres embebido dentro de la propia app, guardando sus datos en la carpeta de datos del usuario. */
export const startEmbeddedPostgres = async () => {
  const dataDir = path.join(app.getPath('userData'), 'postgres-data');

  pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'postgres',
    password: 'postgres',
    port: 5432,
    persistent: true
  });

  const isInitialized = await pg.isInitialized();
  const isFirstRun = !isInitialized;

  if (isFirstRun) {
    await pg.initialise();
  }

  await pg.start();

  if (isFirstRun) {
    await pg.createDatabase('cafebar');
  }

  return { isFirstRun };
};

/* Detiene el Postgres embebido de forma ordenada al cerrar la aplicación. */
export const stopEmbeddedPostgres = async () => {
  if (pg) await pg.stop();
};
