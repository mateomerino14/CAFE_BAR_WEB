import {X} from 'lucide-react';
import {TextInput} from '../atoms/TextInput';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'flex max-h-72 flex-col divide-y divide-slate-100 overflow-y-auto rounded-xl bg-white shadow-sm',
  row: 'flex flex-wrap items-center gap-3 px-4 py-3',
  info: 'min-w-0 flex-1',
  name: `font-semibold ${colors.textPrimary}`,
  meta: 'text-xs text-slate-500',
  quantityInput: 'shrink-0 text-center',
  subtotal: 'w-24 shrink-0 text-right text-sm font-bold text-blue-600',
  removeButton: 'flex shrink-0 items-center justify-center rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200',
  totalRow: 'flex items-center justify-end gap-3 px-4 py-3',
  totalLabel: `text-sm font-bold ${colors.textPrimary}`,
  totalValue: 'text-lg font-bold text-red-600'
};

export const PromotionProductsStagingList = ({items, onRemove, onUpdateQuantity, total}) => {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className={styles.wrapper}>
      {items.map((item) => (
        <div key={item.id_prod} className={styles.row}>
          <div className={styles.info}>
            <p className={styles.name}>{item.nom_prod}</p>
            <p className={styles.meta}>Bs {Number(item.precio_venta).toFixed(2)} c/u</p>
          </div>
          <TextInput
            value={item.cantidad}
            onChange={(event) => onUpdateQuantity(item.id_prod, event.target.value.replace(/\D/g, ''))}
            maxLength={3}
            className={styles.quantityInput}
            style={{ width: '4.5rem' }}
          />
          <span className={styles.subtotal}>Bs {(Number(item.precio_venta) * Number(item.cantidad || 0)).toFixed(2)}</span>
          <button type="button" className={styles.removeButton} onClick={() => onRemove(item.id_prod)}>
            <X size={16} />
          </button>
        </div>
      ))}
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>Bs {total.toFixed(2)}</span>
      </div>
    </div>
  );
};