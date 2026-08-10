import {X} from 'lucide-react';
import {TextInput} from '../atoms/TextInput';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'flex flex-col divide-y divide-slate-100 rounded-xl bg-white shadow-sm',
  row: 'flex items-center gap-3 px-4 py-3',
  info: 'flex-1',
  name: `font-semibold ${colors.textPrimary}`,
  meta: 'text-xs text-slate-500',
  quantityGroup: 'flex w-32 shrink-0 items-center gap-1.5',
  quantityInput: 'text-center',
  unit: 'text-xs font-semibold text-slate-500',
  removeButton: 'flex shrink-0 items-center justify-center rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
};

export const IngredientStagingList = ({items, onRemove, onUpdateQuantity}) => {
  if (items.length === 0) return null;
  return (
    <div className={styles.wrapper}>
      {items.map((item) => (
        <div key={item.id_ing} className={styles.row}>
          <div className={styles.info}>
            <p className={styles.name}>{item.nom_ing}</p>
            {item.descripcion && <p className={styles.meta}>{item.descripcion}</p>}
          </div>
          <div className={styles.quantityGroup}>
            <TextInput
              value={item.cantidad}
              onChange={(event) => onUpdateQuantity(item.id_ing, event.target.value)}
              maxLength={11}
              className={styles.quantityInput}
            />
            <span className={styles.unit}>{item.unidad_medida}</span>
          </div>
          <button type="button" className={styles.removeButton} onClick={() => onRemove(item.id_ing)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};