import { randomUUID } from 'crypto';
import { supabase } from '../config/supabaseClient.js';

const BUCKET = 'avatares';

/* Sube una fotografía al almacenamiento de Supabase utilizando una ruta única y devuelve su URL pública. */
export const uploadPhoto = async (folder, file) => {
  const extension = file.originalname.split('.').pop();
  const path = `${folder}/${randomUUID()}.${extension}`;
  const {error} = await supabase.storage
    .from(BUCKET)
    .upload(path, file.buffer, {contentType: file.mimetype, upsert: false});
  if (error) throw error;
  const {data} = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
};