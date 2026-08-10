import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Toast} from '../atoms/Toast';
import {FormField} from '../molecules/FormField';
import {useRegisterSection} from '../../features/sections/hooks/useRegisterSection';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  form: 'mt-4 flex flex-col gap-4',
  actions: 'mt-4 flex flex-col gap-2'
};

export const RegisterSectionModal = ({onClose, onRegistered}) => {
  const { nombre, setNombre, descripcion, setDescripcion, cantidadMesas, setCantidadMesas, error, loading, handleSubmit } = useRegisterSection(onRegistered);
  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Registro de nueva sección</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField label="NOMBRE DE SECCIÓN">
          <TextInput value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Ej: Terraza Principal" maxLength={17} />
        </FormField>
        <FormField label="DESCRIPCIÓN (OPCIONAL)">
          <TextInput value={descripcion} onChange={(event) => setDescripcion(event.target.value)} placeholder="Opcional" maxLength={40} />
        </FormField>
        <FormField label="CANTIDAD DE MESAS">
          <TextInput value={cantidadMesas} onChange={(event) => setCantidadMesas(event.target.value.replace(/\D/g, ''))} placeholder="Número entero" maxLength={4} />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>{loading ? 'REGISTRANDO...' : 'REGISTRAR'}</Button>
          <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
        </div>
      </form>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};