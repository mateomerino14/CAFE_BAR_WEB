import {Pencil} from 'lucide-react';
import {ImageBox} from '../atoms/ImageBox';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[600px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  editButton: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${colors.buttonPrimary}`
};

export const PromotionTable = ({promotions, onEdit}) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            <th className={styles.th}>Promoción</th>
            <th className={styles.th}>Precio</th>
            <th className={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((promotion) => (
            <tr key={promotion.id_prom}>
              <td className={styles.td}>
                <ImageBox src={promotion.img_prom} alt={promotion.nom_prom} className="h-12 w-12" />
              </td>
              <td className={`${styles.td} ${styles.name}`}>{promotion.nom_prom}</td>
              <td className={styles.td}>Bs {Number(promotion.precio_prom).toFixed(2)}</td>
              <td className={styles.td}>
                <button type="button" className={styles.editButton} onClick={() => onEdit(promotion)}>
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