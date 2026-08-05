import { TextInput } from '../atoms/TextInput';
import { ImagePicker } from '../molecules/ImagePicker';
import { FormField } from '../molecules/FormField';

const styles = {
  wrapper: 'flex flex-col gap-5',
  photoRow: 'flex justify-center',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2'
};

export const PromotionFormFields = ({ values, onChange, photoPreview, onPhotoChange }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.photoRow}>
        <ImagePicker src={photoPreview} alt="Imagen de la promoción" onFileChange={onPhotoChange} />
      </div>
      <div className={styles.grid}>
        <FormField label="NOMBRE">
          <TextInput value={values.nombre} onChange={(event) => onChange('nombre', event.target.value)} placeholder="Nombre de la promoción" maxLength={30} />
        </FormField>
        <FormField label="PRECIO">
          <TextInput value={values.precioProm} onChange={(event) => onChange('precioProm', event.target.value)} placeholder="0.00" maxLength={11} />
        </FormField>
      </div>
    </div>
  );
};