import {Pencil, Power} from 'lucide-react';
import {ImageBox} from '../atoms/ImageBox';

const styles = {
  wrapper: 'flex flex-col divide-y divide-slate-100 rounded-xl bg-white shadow-sm',
  row: 'grid grid-cols-[48px_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[48px_1fr_110px_240px]',
  thumb: 'h-12 w-12 shrink-0',
  name: 'min-w-0 truncate font-semibold text-slate-800',
  statusWrapper: 'col-span-2 flex items-center gap-2 whitespace-nowrap sm:col-span-1 sm:w-[110px]',
  statusDot: 'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
  statusActive: 'bg-emerald-500',
  statusInactive: 'bg-red-500',
  statusLabel: 'text-xs font-semibold',
  actions: 'col-span-2 flex gap-3 sm:col-span-1',
  editButton: 'flex w-24 items-center justify-center gap-1.5 rounded-lg bg-blue-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-blue-600',
  toggleActive: 'flex w-28 items-center justify-center gap-1.5 rounded-lg bg-red-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-red-600',
  toggleInactive: 'flex w-28 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-2 py-1.5 text-xs font-bold text-white hover:bg-emerald-600'
};

export const SubcategoryManageList = ({subcategories, onEdit, onToggle}) => {
  return (
    <div className={styles.wrapper}>
      {subcategories.map((subcategory) => (
        <div key={subcategory.id_subcategoria} className={styles.row}>
          <div className={styles.thumb}>
            <ImageBox src={subcategory.imagen_subcategoria} alt={subcategory.nombre} className="h-12 w-12" />
          </div>
          <span className={styles.name}>{subcategory.nombre}</span>
          <div className={styles.statusWrapper}>
            <span className={`${styles.statusDot} ${subcategory.activa ? styles.statusActive : styles.statusInactive}`} />
            <span className={styles.statusLabel}>{subcategory.activa ? 'Activa' : 'Inactiva'}</span>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.editButton} onClick={() => onEdit(subcategory)}>
              <Pencil size={14} /> EDITAR
            </button>
            <button
              type="button"
              className={subcategory.activa ? styles.toggleActive : styles.toggleInactive}
              onClick={() => onToggle(subcategory)}
            >
              <Power size={14} /> {subcategory.activa ? 'DESACTIVAR' : 'ACTIVAR'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};