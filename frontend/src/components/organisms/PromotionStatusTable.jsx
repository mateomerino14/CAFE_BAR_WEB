import {Power} from 'lucide-react';
import {ImageBox} from '../atoms/ImageBox';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[600px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  statusWrapper: 'flex items-center gap-2 whitespace-nowrap',
  statusDot: 'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
  statusActive: 'bg-emerald-500',
  statusInactive: 'bg-red-500',
  statusLabel: 'text-xs font-semibold',
  toggleActive: 'flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600',
  toggleInactive: 'flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600'
};

export const PromotionStatusTable = ({promotions, onToggle}) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            <th className={styles.th}>Promoción</th>
            <th className={styles.th}>Precio</th>
            <th className={styles.th}>Estado</th>
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
                <div className={styles.statusWrapper}>
                  <span className={`${styles.statusDot} ${promotion.activo ? styles.statusActive : styles.statusInactive}`} />
                  <span className={styles.statusLabel}>{promotion.activo ? 'Activa' : 'Inactiva'}</span>
                </div>
              </td>
              <td className={styles.td}>
                <button type="button" className={promotion.activo ? styles.toggleActive : styles.toggleInactive} onClick={() => onToggle(promotion)}>
                  <Power size={14} /> {promotion.activo ? 'DESHABILITAR' : 'HABILITAR'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};