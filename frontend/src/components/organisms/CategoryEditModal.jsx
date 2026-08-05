import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Toast } from '../atoms/Toast';
import { FormField } from '../molecules/FormField';
import { ImagePicker } from '../molecules/ImagePicker';
import { useEditCategory } from '../../features/categories/hooks/useEditCategory';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  wrapper: 'flex flex-col items-center gap-4',
  actions: 'mt-4 flex w-full flex-col gap-2'
};

export const CategoryEditModal = ({ category, onClose, onSaved }) => {
  const { name, setName, preview, handleFileChange, error, loading, handleSave } = useEditCategory(category, onSaved);

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar categoría</p>
        <h2 className={styles.title}>{category.nombre_categoria}</h2>
      </div>
      <form onSubmit={handleSave} className={styles.wrapper}>
        <ImagePicker src={preview} alt="Imagen de categoría" onFileChange={handleFileChange} />
        <FormField label="NOMBRE">
          <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la categoría" maxLength={30} />
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