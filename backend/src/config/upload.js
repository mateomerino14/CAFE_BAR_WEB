import multer from 'multer';

/*Configura la subida de imágenes en memoria antes de guardarlas como archivo local (ver utils/storage.js) */
export const upload = multer({storage: multer.memoryStorage(),limits: {fileSize: 5 * 1024 * 1024}});