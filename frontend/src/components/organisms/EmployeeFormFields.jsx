import { TextInput } from '../atoms/TextInput';
import { Select } from '../atoms/Select';
import { CoverImagePicker } from '../molecules/CoverImagePicker';
import { FormField } from '../molecules/FormField';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'flex flex-col gap-5',
  photoRow: 'flex flex-col items-center gap-2',
  photoHint: `text-xs ${colors.textSecondary}`,
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2'
};

export const EmployeeFormFields = ({ values, onChange, cargoOptions, photoPreview, onPhotoChange }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.photoRow}>
        <CoverImagePicker src={photoPreview} alt="Foto del empleado" onFileChange={onPhotoChange} />
        <span className={styles.photoHint}>Foto opcional — si no subes una, se generará un avatar automático</span>
      </div>
      <div className={styles.grid}>
        <FormField label="NOMBRE">
          <TextInput value={values.nombre} onChange={(event) => onChange('nombre', event.target.value)} placeholder="Nombre" maxLength={30} />
        </FormField>
        <FormField label="APELLIDO PATERNO">
          <TextInput value={values.apellidoPaterno} onChange={(event) => onChange('apellidoPaterno', event.target.value)} placeholder="Apellido paterno" maxLength={30} />
        </FormField>
        <FormField label="APELLIDO MATERNO">
          <TextInput value={values.apellidoMaterno} onChange={(event) => onChange('apellidoMaterno', event.target.value)} placeholder="Apellido materno" maxLength={30} />
        </FormField>
        <FormField label="CÉDULA DE IDENTIDAD">
          <TextInput value={values.ci} onChange={(event) => onChange('ci', event.target.value)} placeholder="Mínimo 5 dígitos" maxLength={15} />
        </FormField>
        <FormField label="CELULAR">
          <TextInput value={values.celular} onChange={(event) => onChange('celular', event.target.value)} placeholder="Mínimo 7 dígitos" maxLength={15} />
        </FormField>
        <FormField label="DIRECCIÓN">
          <TextInput value={values.direccion} onChange={(event) => onChange('direccion', event.target.value)} placeholder="Dirección" maxLength={30} />
        </FormField>
        <FormField label="CORREO (OPCIONAL)">
          <TextInput type="email" value={values.correo} onChange={(event) => onChange('correo', event.target.value)} placeholder="correo@ejemplo.com" maxLength={30} />
        </FormField>
        <FormField label="CARGO">
          <Select
            options={cargoOptions.map((option) => ({ value: option.id_cargo, label: option.nom_carg }))}
            placeholder="Seleccione un cargo"
            value={values.idCargo}
            onChange={(event) => onChange('idCargo', event.target.value)}
          />
        </FormField>
      </div>
    </div>
  );
};