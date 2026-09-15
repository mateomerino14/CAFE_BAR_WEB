import { query } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

/* Script para crear o actualizar el usuario DIRECTORIO con una contraseña segura */
const run = async () => {
  const password = process.argv[2];
  if (!password) {
    console.log('Uso: node src/scripts/seedDirectorio.js <password>');
    process.exit(1);
  }
  const passwordHash = await hashPassword(password);
  const existingResult = await query(`SELECT id_admin FROM directorio LIMIT 1`);
  const existing = existingResult.rows[0];

  if (existing) {
    await query(`UPDATE directorio SET contrasena_admin = $1 WHERE id_admin = $2`, [passwordHash, existing.id_admin]);
  } else {
    await query(`INSERT INTO directorio (nom_admin, contrasena_admin) VALUES ('DIRECTORIO', $1)`, [passwordHash]);
  }
  console.log('Directorio configurado correctamente');
  process.exit(0);
};
run();
