import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
const PUBLIC_BASE_URL = process.env.UPLOADS_PUBLIC_URL || 'http://localhost:3000/uploads';

/* Guarda una fotografía como archivo local dentro de la carpeta de uploads y devuelve su URL pública dentro de la red local. */
export const uploadPhoto = async (folder, file) => {
  const extension = file.originalname.split('.').pop();
  const fileName = `${randomUUID()}.${extension}`;
  const folderPath = path.join(UPLOADS_ROOT, folder);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const fullPath = path.join(folderPath, fileName);
  fs.writeFileSync(fullPath, file.buffer);

  return `${PUBLIC_BASE_URL}/${folder}/${fileName}`;
};
