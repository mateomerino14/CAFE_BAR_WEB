import { Pencil, X } from 'lucide-react';
import { ImageBox } from '../atoms/ImageBox';

const styles = {
  wrapper: 'flex flex-col divide-y divide-slate-100 rounded-xl bg-white shadow-sm',
  empty: 'rounded-xl bg-white p-4 text-center text-sm text-slate-400 shadow-sm',
  row: 'flex flex-wrap items-center gap-3 px-4 py-3',
  rowEditing: 'bg-blue-50',
  thumb: 'h-12 w-12 shrink-0',
  name: 'flex-1 font-semibold text-slate-800',
  actions: 'flex flex-wrap gap-2',
  editButton: 'flex items-center gap-1.5 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600',
  removeButton: 'flex items-center justify-center rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200'
};

export const SubcategoryStagingList = ({ items, onRemove, onEdit, editingId }) => {
  if (items.length === 0) {
    return <p className={styles.empty}>Aún no agregaste subcategorías</p>;
  }

  return (
    <div className={styles.wrapper}>
      {items.map((item) => (
        <div key={item.id} className={`${styles.row} ${editingId === item.id ? styles.rowEditing : ''}`}>
          <div className={styles.thumb}>
            <ImageBox src={item.preview} alt={item.nombre} className="h-12 w-12" />
          </div>
          <span className={styles.name}>{item.nombre}</span>
          <div className={styles.actions}>
            <button type="button" className={styles.editButton} onClick={() => onEdit(item)}>
              <Pencil size={14} /> EDITAR
            </button>
            <button type="button" className={styles.removeButton} onClick={() => onRemove(item.id)}>
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};