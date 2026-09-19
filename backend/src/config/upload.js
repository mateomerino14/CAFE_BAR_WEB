import multer from 'multer';

/*Configura la subida de imágenes en memoria antes de guardarlas como archivo local (ver utils/storage.js).
  Límite de 15MB: las fotos de celulares modernos suelen pesar entre 3 y 10MB.*/
export const upload = multer({storage: multer.memoryStorage(),limits: {fileSize: 15 * 1024 * 1024}});