import multer from 'multer';

/*Subida de una imagen al storage de supabase o bucket */
export const upload = multer({storage: multer.memoryStorage(),limits: {fileSize: 5 * 1024 * 1024}});