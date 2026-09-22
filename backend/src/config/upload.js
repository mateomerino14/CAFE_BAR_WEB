import multer from 'multer';

/*Configura la subida de imágenes en memoria antes de guardarlas como archivo local con límite de 15MB*/
export const upload = multer({storage: multer.memoryStorage(),limits: {fileSize: 15 * 1024 * 1024}});