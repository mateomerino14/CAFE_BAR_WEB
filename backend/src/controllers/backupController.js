import {exportDatabaseToExcel, importDatabaseFromExcel, sendBackupByEmail} from '../services/backupService.js';

/* Controlador para exportar un respaldo de la base de datos */
export const exportBackupHandler = async (req, res) => {
  try {
    const buffer = await exportDatabaseToExcel();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="backup_cafebar.xlsx"');
    return res.send(Buffer.from(buffer));
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'No se pudo generar el backup'});
  }
};

/* Controlador para importar un respaldo desde un archivo Excel */
export const importBackupHandler = async (req, res) => {
  const { confirmacion } = req.body;
  if (confirmacion !== 'ELIMINAR TODO') {
    return res.status(400).json({message: 'Debe escribir "ELIMINAR TODO" para confirmar'});
  }
  if (!req.file) {
    return res.status(400).json({message: 'Debe adjuntar un archivo Excel'});
  }
  try {
    await importDatabaseFromExcel(req.file.buffer);
    return res.json({message: 'Base de datos restaurada correctamente'});
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Ocurrió un error durante la importación. Revisa la base manualmente, algunas tablas pudieron quedar a medias.'});
  }
};

/* Controlador para enviar un respaldo al correo indicado */
export const sendBackupEmailHandler = async (req, res) => {
  const { correoDestino } = req.body;
  if (!correoDestino) {
    return res.status(400).json({message: 'Ingrese el correo de destino'});
  }
  try {
    await sendBackupByEmail(correoDestino.trim());
    return res.json({message: 'Backup enviado por correo correctamente'});
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'No se pudo enviar el backup por correo'});
  }
};