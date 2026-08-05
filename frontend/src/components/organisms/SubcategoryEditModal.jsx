import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Toast } from '../atoms/Toast';
import { FormField } from '../molecules/FormField';
import { ImagePicker } from '../molecules/ImagePicker';
import { useEditSubcategory } from '../../features/categories/hooks/useEditSubcategory';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  wrapper: 'flex flex-col items-center gap-4',
  actions: 'mt-4 flex w-full flex-col gap-2'
};

export const SubcategoryEditModal = ({ subcategory, onClose, onSaved }) => {
  const { name, setName, preview, handleFileChange, error, loading, handleSave } = useEditSubcategory(subcategory, onSaved);

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar subcategoría</p>
        <h2 className={styles.title}>{subcategory.nombre}</h2>
      </div>
      <form onSubmit={handleSave} className={styles.wrapper}>
        <ImagePicker src={preview} alt="Imagen de subcategoría" onFileChange={handleFileChange} />
        <FormField label="NOMBRE">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la subcategoría" maxLength={50} />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Button>
          <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
        </div>
      </form>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};