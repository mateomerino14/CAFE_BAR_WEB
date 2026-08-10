import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Toast} from '../atoms/Toast';
import {FormField} from '../molecules/FormField';
import {useTaxLink} from '../../features/config/hooks/useTaxLink';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  form: 'mt-4 flex flex-col gap-4',
  actions: 'mt-4 flex flex-col gap-2'
};

export const TaxLinkModal = ({onClose, onSaved}) => {
  const {enlace, setEnlace, error, loading, handleSubmit} = useTaxLink(onSaved);
  return (
    <Modal onClose={onClose}>
      <h2 className={styles.title}>Modificar enlace de Impuestos</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <FormField label="URL DEL SIAT">
          <TextInput value={enlace} onChange={(event) => setEnlace(event.target.value)} placeholder="https://siat.impuestos.gob.bo/..." />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR'}</Button>
          <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
        </div>
      </form>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};