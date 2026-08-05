import { Pencil, ListTree } from 'lucide-react';
import { ImageBox } from '../atoms/ImageBox';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[600px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  actions: 'flex flex-wrap gap-2',
  editButton: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${colors.buttonPrimary}`,
  manageButton: 'flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600'
};

export const CategoryTable = ({ categories, onEdit, onManage }) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            <th className={styles.th}>Categoría</th>
            <th className={styles.th}>Subcategorías activas</th>
            <th className={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id_categoria}>
              <td className={styles.td}>
                <ImageBox src={category.imagen_categoria} alt={category.nombre_categoria} className="h-12 w-12" />
              </td>
              <td className={`${styles.td} ${styles.name}`}>{category.nombre_categoria}</td>
              <td className={styles.td}>{category.subcategorias_count}</td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  <button type="button" className={styles.editButton} onClick={() => onEdit(category)}>
                    <Pencil size={14} /> EDITAR
                  </button>
                  <button type="button" className={styles.manageButton} onClick={() => onManage(category)}>
                    <ListTree size={14} /> SUBCATEGORÍAS
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};