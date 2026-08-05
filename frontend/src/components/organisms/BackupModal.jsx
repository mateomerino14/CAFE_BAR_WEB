import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Toast } from '../atoms/Toast';
import { FormField } from '../molecules/FormField';
import { useBackupActions } from '../../features/config/hooks/useBackupActions';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  section: 'mt-5 rounded-xl border border-slate-200 p-4',
  sectionTitle: 'text-sm font-bold text-slate-700',
  sectionBody: 'mt-2 flex flex-col gap-3',
  warning: 'rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700',
  fileInput: 'w-full rounded-lg border-2 border-slate-300 bg-white p-2 text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-500 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-600',
  fileSelected: 'text-xs font-semibold text-emerald-600',
  hint: 'text-xs text-slate-500',
  back: 'mt-5'
};

export const BackupModal = ({ onClose }) => {
  const { exporting, importing, sendingEmail, error, success, handleExport, handleImport, handleSendEmail } = useBackupActions();
  const [file, setFile] = useState(null);
  const [confirmacion, setConfirmacion] = useState('');
  const [correoDestino, setCorreoDestino] = useState('');

  const onImportSubmit = async (event) => {
    event.preventDefault();
    const ok = await handleImport(file, confirmacion);
    if (ok) {
      setFile(null);
      setConfirmacion('');
    }
  };

  const onEmailSubmit = async (event) => {
    event.preventDefault();
    await handleSendEmail(correoDestino);
  };

  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>Backup de la base de datos</h2>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Exportar a Excel</p>
        <div className={styles.sectionBody}>
          <p className={styles.hint}>Descarga un archivo .xlsx con una hoja por cada tabla del sistema.</p>
          <Button type="button" onClick={handleExport} disabled={exporting}>{exporting ? 'GENERANDO...' : 'DESCARGAR BACKUP'}</Button>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Enviar backup por correo</p>
        <form onSubmit={onEmailSubmit} className={styles.sectionBody}>
          <FormField label="CORREO DE DESTINO">
            <TextInput type="email" value={correoDestino} onChange={(event) => setCorreoDestino(event.target.value)} placeholder="destino@correo.com" />
          </FormField>
          <Button type="submit" variant="warning" disabled={sendingEmail}>{sendingEmail ? 'ENVIANDO...' : 'ENVIAR POR CORREO'}</Button>
        </form>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Importar desde Excel</p>
        <div className={styles.warning}>
          Esto borra y reemplaza TODAS las tablas del sistema con el contenido del archivo. No se puede deshacer.
        </div>
        <form onSubmit={onImportSubmit} className={styles.sectionBody}>
          <input
            type="file"
            accept=".xlsx"
            className={styles.fileInput}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          {file && <p className={styles.fileSelected}>Archivo seleccionado: {file.name}</p>}
          <FormField label='ESCRIBE "ELIMINAR TODO" PARA CONFIRMAR'>
            <TextInput value={confirmacion} onChange={(event) => setConfirmacion(event.target.value)} placeholder="ELIMINAR TODO" />
          </FormField>
          <Button type="submit" variant="danger" disabled={importing}>{importing ? 'IMPORTANDO...' : 'IMPORTAR Y REEMPLAZAR TODO'}</Button>
        </form>
      </div>

      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </Modal>
  );
};