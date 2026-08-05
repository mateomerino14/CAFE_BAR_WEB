import { TextInput } from '../atoms/TextInput';
import { Textarea } from '../atoms/Textarea';
import { SearchableSelect } from '../molecules/SearchableSelect';
import { ImagePicker } from '../molecules/ImagePicker';
import { FormField } from '../molecules/FormField';

const styles = {
  wrapper: 'flex flex-col gap-5',
  photoRow: 'flex justify-center',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2'
};

export const ProductFormFields = ({ values, onChange, categoryOptions, subcategoryOptions, photoPreview, onPhotoChange }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.photoRow}>
        <ImagePicker src={photoPreview} alt="Foto del producto" onFileChange={onPhotoChange} />
      </div>
      <FormField label="NOMBRE">
        <TextInput value={values.nombre} onChange={(event) => onChange('nombre', event.target.value)} placeholder="Nombre del producto" maxLength={30} />
      </FormField>
      <FormField label="DESCRIPCIÓN (OPCIONAL)">
        <Textarea value={values.descripcion} onChange={(event) => onChange('descripcion', event.target.value)} placeholder="Descripción del producto" maxLength={200} />
      </FormField>
      <div className={styles.grid}>
        <FormField label="PRECIO DE VENTA">
          <TextInput value={values.precioVenta} onChange={(event) => onChange('precioVenta', event.target.value)} placeholder="0.00" maxLength={11} />
        </FormField>
        <FormField label="COSTO DE FABRICACIÓN">
          <TextInput value={values.costoFabricacion} onChange={(event) => onChange('costoFabricacion', event.target.value)} placeholder="0.00" maxLength={11} />
        </FormField>
        <FormField label="CATEGORÍA">
          <SearchableSelect
            options={categoryOptions.map((option) => ({ value: option.id_categoria, label: option.nombre_categoria }))}
            placeholder="Buscar categoría"
            value={values.idCategoria}
            onChange={(value) => onChange('idCategoria', value)}
          />
        </FormField>
        <FormField label="SUBCATEGORÍA">
          <SearchableSelect
            options={subcategoryOptions.map((option) => ({ value: option.id_subcategoria, label: option.nombre }))}
            placeholder={values.idCategoria ? 'Buscar subcategoría' : 'Primero seleccione una categoría'}
            value={values.idSubcategoria}
            onChange={(value) => onChange('idSubcategoria', value)}
            disabled={!values.idCategoria}
          />
        </FormField>
      </div>
    </div>
  );
};