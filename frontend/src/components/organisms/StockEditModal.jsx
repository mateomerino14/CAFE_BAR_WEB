import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {Toast} from '../atoms/Toast';
import {StockFormFields} from './StockFormFields';
import {useEditStock} from '../../features/stock/hooks/useEditStock';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  actions: 'mt-4 flex flex-col gap-2'
};

export const StockEditModal = ({item, onClose, onSaved}) => {
  const { values, updateField, ready, error, loading, handleSave } = useEditStock(item, onSaved);
  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar ingrediente</p>
        <h2 className={styles.title}>{item.nom_ing}</h2>
      </div>
      {ready && (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <StockFormFields values={values} onChange={updateField} isDuplicateName={false} />
          <div className={styles.actions}>
            <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Button>
            <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
          </div>
        </form>
      )}
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};