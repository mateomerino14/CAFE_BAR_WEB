import { Pencil } from 'lucide-react';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[700px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  editButton: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${colors.buttonPrimary}`
};

export const StockTable = ({ items, onEdit }) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Nombre</th>
            <th className={styles.th}>Descripción</th>
            <th className={styles.th}>Cantidad</th>
            <th className={styles.th}>Unidad</th>
            <th className={styles.th}>Precio extra</th>
            <th className={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id_ing}>
              <td className={`${styles.td} ${styles.name}`}>{item.nom_ing}</td>
              <td className={styles.td}>{item.descripcion || '-'}</td>
              <td className={styles.td}>{item.cantidad_stock}</td>
              <td className={styles.td}>{item.unidad_medida}</td>
              <td className={styles.td}>Bs {Number(item.precio_extra).toFixed(2)}</td>
              <td className={styles.td}>
                <button type="button" className={styles.editButton} onClick={() => onEdit(item)}>
                  <Pencil size={14} /> EDITAR
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};