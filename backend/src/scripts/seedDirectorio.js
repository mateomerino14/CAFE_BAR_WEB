import { supabase } from '../config/supabaseClient.js';
import { hashPassword } from '../utils/password.js';

/* Script para crear o actualizar el usuario DIRECTORIO con una contraseña segura */
const run = async () => {
  const password = process.argv[2];
  if (!password) {
    console.log('Uso: node src/scripts/seedDirectorio.js <password>');
    process.exit(1);
  }
  const passwordHash = await hashPassword(password);
  const { data: existing } = await supabase
    .from('directorio')
    .select('id_admin')
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('directorio')
      .update({ contrasena_admin: passwordHash })
      .eq('id_admin', existing.id_admin);
  } 
  else {
    await supabase
      .from('directorio')
      .insert({ nom_admin: 'DIRECTORIO', contrasena_admin: passwordHash });
  }
  console.log('Directorio configurado correctamente');
  process.exit(0);
};
run();