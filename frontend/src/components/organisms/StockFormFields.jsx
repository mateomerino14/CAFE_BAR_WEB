import {TextInput} from '../atoms/TextInput';
import {Textarea} from '../atoms/Textarea';
import {SearchableSelect} from '../molecules/SearchableSelect';
import {FormField} from '../molecules/FormField';
import {UNIT_OPTIONS} from '../../constants/units';

const styles = {
  wrapper: 'flex flex-col gap-5',
  grid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  warning: 'text-xs font-semibold text-red-600'
};

export const StockFormFields = ({values, onChange, isDuplicateName}) => {
  return (
    <div className={styles.wrapper}>
      <FormField label="NOMBRE">
        <TextInput value={values.nombre} onChange={(event) => onChange('nombre', event.target.value)} placeholder="Nombre del ingrediente" maxLength={30} />
        {isDuplicateName && <span className={styles.warning}>⚠ Este ingrediente ya está registrado</span>}
      </FormField>
      <div className={styles.grid}>
        <FormField label="UNIDAD DE MEDIDA">
          <SearchableSelect
            options={UNIT_OPTIONS}
            placeholder="Seleccione una unidad"
            value={values.unidadMedida}
            onChange={(value) => onChange('unidadMedida', value)}
          />
        </FormField>
        <FormField label="CANTIDAD DE STOCK">
          <TextInput value={values.cantidadStock} onChange={(event) => onChange('cantidadStock', event.target.value)} placeholder="0.00" maxLength={11} />
        </FormField>
        <FormField label="PRECIO EXTRA (Bs) (OPCIONAL)">
          <TextInput value={values.precioExtra} onChange={(event) => onChange('precioExtra', event.target.value)} placeholder="0.00" maxLength={11} />
        </FormField>
      </div>
      <FormField label="DESCRIPCIÓN (OPCIONAL)">
        <Textarea value={values.descripcion} onChange={(event) => onChange('descripcion', event.target.value)} placeholder="Descripción del ingrediente" maxLength={200} />
      </FormField>
    </div>
  );
};