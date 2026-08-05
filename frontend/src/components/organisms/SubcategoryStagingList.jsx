import { X } from 'lucide-react';
import { ImageBox } from '../atoms/ImageBox';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'flex flex-col divide-y divide-slate-100 rounded-xl bg-white shadow-sm',
  row: 'flex items-center gap-3 px-4 py-3',
  thumb: 'h-14 w-14 shrink-0',
  name: `flex-1 font-semibold ${colors.textPrimary}`,
  removeButton: 'flex shrink-0 items-center justify-center rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
};

export const SubcategoryStagingList = ({ items, onRemove }) => {
  if (items.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      {items.map((item) => (
        <div key={item.id} className={styles.row}>
          <div className={styles.thumb}>
            <ImageBox src={item.preview} alt={item.nombre} className="h-14 w-14" />
          </div>
          <span className={styles.name}>{item.nombre}</span>
          <button type="button" className={styles.removeButton} onClick={() => onRemove(item.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};