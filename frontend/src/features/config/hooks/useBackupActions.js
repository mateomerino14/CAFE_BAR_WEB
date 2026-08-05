import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { downloadBackup, importBackup, sendBackupEmail } from '../services/backupService';

export const useBackupActions = () => {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  const handleExport = async () => {
    setError('');
    setExporting(true);
    try {
      await downloadBackup();
      setSuccess('Backup descargado correctamente');
    } catch (err) {
      setError('No se pudo generar el backup');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file, confirmacion) => {
    setError('');

    if (confirmacion !== 'ELIMINAR TODO') {
      setError('Debe escribir exactamente "ELIMINAR TODO" para confirmar');
      return false;
    }

    if (!file) {
      setError('Debe seleccionar un archivo Excel');
      return false;
    }

    setImporting(true);
    try {
      await importBackup(file, confirmacion);
      setSuccess('Base de datos restaurada correctamente');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo importar el backup');
      return false;
    } finally {
      setImporting(false);
    }
  };

  const handleSendEmail = async (correoDestino) => {
    setError('');

    if (!correoDestino.trim()) {
      setError('Ingrese el correo de destino');
      return false;
    }

    setSendingEmail(true);
    try {
      await sendBackupEmail(correoDestino.trim());
      setSuccess('Backup enviado por correo correctamente');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el backup');
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  return { exporting, importing, sendingEmail, error, success, handleExport, handleImport, handleSendEmail };
};