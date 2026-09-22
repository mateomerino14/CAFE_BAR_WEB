import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Toast} from '../atoms/Toast';
import {FormField} from '../molecules/FormField';
import {useSystemConfig} from '../../features/config/hooks/useSystemConfig';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  section: 'mt-4 flex flex-col gap-3',
  hint: 'text-xs text-slate-500',
  statusBadge: 'inline-block rounded px-2 py-1 text-xs font-bold',
  statusOk: 'bg-emerald-100 text-emerald-700',
  statusMissing: 'bg-red-100 text-red-700',
  back: 'mt-5'
};

export const EmailConfigModal = ({ onClose }) => {
  const {
    hasApiKey, brevoApiKey, setBrevoApiKey, brevoSenderEmail, setBrevoSenderEmail, brevoSenderName, setBrevoSenderName,
    loading, saving, handleSave, error, success
  } = useSystemConfig();
  return (
    <Modal onClose={onClose} size="sm">
      <h2 className={styles.title}>Configurar Envío de Correos</h2>
      <p className={styles.hint}>
        Necesario para recuperación de contraseña, envío de backups y reportes por correo.
        Se obtiene una API Key gratis creando una cuenta en brevo.com.
      </p>
      {loading ? (
        <p className={styles.hint}>Cargando...</p>
      ) : (
        <div className={styles.section}>
          {hasApiKey
            ? <span className={`${styles.statusBadge} ${styles.statusOk}`}>API Key configurada</span>
            : <span className={`${styles.statusBadge} ${styles.statusMissing}`}>Sin configurar — los correos no se enviarán</span>}
          <FormField label="API KEY DE BREVO">
            <TextInput
              type="password"
              value={brevoApiKey}
              onChange={(event) => setBrevoApiKey(event.target.value)}
              placeholder={hasApiKey ? '•••••••••••• (dejar en blanco para no cambiarla)' : 'xkeysib-...'}
            />
          </FormField>
          <FormField label="CORREO REMITENTE">
            <TextInput
              type="email"
              value={brevoSenderEmail}
              onChange={(event) => setBrevoSenderEmail(event.target.value)}
              placeholder="correo@tudominio.com"
            />
          </FormField>
          <FormField label="NOMBRE REMITENTE">
            <TextInput
              value={brevoSenderName}
              onChange={(event) => setBrevoSenderName(event.target.value)}
              placeholder="Cafebar"
            />
          </FormField>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'GUARDANDO...' : 'GUARDAR'}
          </Button>
        </div>
      )}
      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </Modal>
  );
};
