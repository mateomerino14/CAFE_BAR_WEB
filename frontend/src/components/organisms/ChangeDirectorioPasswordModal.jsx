import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { PasswordField } from '../molecules/PasswordField';
import { FormField } from '../molecules/FormField';
import { useChangeDirectorioPassword } from '../../features/config/hooks/useChangeDirectorioPassword';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  form: 'mt-4 flex flex-col gap-4',
  actions: 'mt-4 flex flex-col gap-2'
};

export const ChangeDirectorioPasswordModal = ({ onClose, onSaved }) => {
  const { actual, setActual, nueva, setNueva, repetir, setRepetir, error, loading, handleSubmit } = useChangeDirectorioPassword(onSaved);

  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Cambiar contraseña del DIRECTORIO</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField label="CONTRASEÑA ACTUAL">
          <PasswordField value={actual} onChange={(event) => setActual(event.target.value)} placeholder="Contraseña actual" />
        </FormField>
        <FormField label="NUEVA CONTRASEÑA">
          <PasswordField value={nueva} onChange={(event) => setNueva(event.target.value)} placeholder="Mínimo 4 caracteres" />
        </FormField>
        <FormField label="REPETIR NUEVA CONTRASEÑA">
          <PasswordField value={repetir} onChange={(event) => setRepetir(event.target.value)} placeholder="Repita la nueva contraseña" />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'CAMBIAR CONTRASEÑA'}</Button>
          <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
        </div>
      </form>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};