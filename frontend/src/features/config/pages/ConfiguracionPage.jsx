import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../components/templates/MainLayout';
import { Toast } from '../../../components/atoms/Toast';
import { TaxLinkModal } from '../../../components/organisms/TaxLinkModal';
import { ChangeDirectorioPasswordModal } from '../../../components/organisms/ChangeDirectorioPasswordModal';
import { BackupModal } from '../../../components/organisms/BackupModal';
import { PrinterConfigModal } from '../../../components/organisms/PrinterConfigModal';
import { PhysicalDeletionModal } from '../../../components/organisms/PhysicalDeletionModal';
import { useDisclosure } from '../../../hooks/useDisclosure';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';

const styles = {
  wrapper: 'mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-xl bg-blue-50 p-6',
  menuButton: 'w-full rounded-lg px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02]'
};

export const ConfiguracionPage = () => {
  const navigate = useNavigate();
  const taxLink = useDisclosure(false);
  const changePassword = useDisclosure(false);
  const backup = useDisclosure(false);
  const printerConfig = useDisclosure(false);
  const deletion = useDisclosure(false);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));

  return (
    <>
      <MainLayout title="CONFIGURACIÓN">
        <div className={styles.wrapper}>
          <button type="button" className={styles.menuButton} style={{ backgroundColor: '#0891b2' }} onClick={taxLink.open}>
            MODIFICAR ENLACE DE IMPUESTOS
          </button>
          <button type="button" className={styles.menuButton} style={{ backgroundColor: '#dc2626' }} onClick={changePassword.open}>
            CAMBIAR CONTRASEÑA DEL DIRECTORIO
          </button>
          <button type="button" className={styles.menuButton} style={{ backgroundColor: '#2563eb' }} onClick={() => navigate('/administracion/ventas-diarias')}>
            VENTAS DIARIAS
          </button>
          <button type="button" className={styles.menuButton} style={{ backgroundColor: '#059669' }} onClick={backup.open}>
            EXPORTAR / IMPORTAR / ENVIAR BACKUP
          </button>
          <button type="button" className={styles.menuButton} style={{ backgroundColor: '#0891b2' }} onClick={printerConfig.open}>
            CONFIGURAR IMPRESORAS
          </button>
          <button type="button" className={styles.menuButton} style={{ backgroundColor: '#7f1d1d' }} onClick={deletion.open}>
            ELIMINACIÓN FÍSICA DE REGISTROS
          </button>
        </div>
      </MainLayout>
      {taxLink.isOpen && (
        <TaxLinkModal
          onClose={taxLink.close}
          onSaved={() => {
            taxLink.close();
            setSuccess('El enlace fue actualizado correctamente');
          }}
        />
      )}
      {changePassword.isOpen && (
        <ChangeDirectorioPasswordModal
          onClose={changePassword.close}
          onSaved={() => {
            changePassword.close();
            setSuccess('Contraseña del DIRECTORIO actualizada');
          }}
        />
      )}
      {backup.isOpen && <BackupModal onClose={backup.close} />}
      {printerConfig.isOpen && <PrinterConfigModal onClose={printerConfig.close} />}
      {deletion.isOpen && <PhysicalDeletionModal onClose={deletion.close} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};