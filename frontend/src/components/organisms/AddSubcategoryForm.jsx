import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {Toast} from '../atoms/Toast';
import {FormField} from '../molecules/FormField';
import {ImagePicker} from '../molecules/ImagePicker';
import {useAddSubcategory} from '../../features/categories/hooks/useAddSubcategory';

const styles = {
  wrapper: 'flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4'
};

export const AddSubcategoryForm = ({categoryId, onAdded}) => {
  const {name, setName, preview, handleFileChange, error, loading, handleSubmit} = useAddSubcategory(categoryId, onAdded);
  return (
    <form onSubmit={handleSubmit} className={styles.wrapper}>
      <ImagePicker src={preview} alt="Imagen de subcategoría" onFileChange={handleFileChange} />
      <FormField label="NOMBRE">
        <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de la subcategoría" maxLength={50} />
      </FormField>
      <Button type="submit" disabled={loading}>{loading ? 'AGREGANDO...' : 'AGREGAR SUBCATEGORÍA'}</Button>
      {error && <Toast>{error}</Toast>}
    </form>
  );
};