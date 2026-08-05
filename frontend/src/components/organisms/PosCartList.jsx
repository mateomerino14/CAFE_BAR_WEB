import { useState } from 'react';
import { X } from 'lucide-react';
import { TextInput } from '../atoms/TextInput';
import { Pagination } from '../molecules/Pagination';
import { OrderItemDetailModal } from './OrderItemDetailModal';
import { usePagination } from '../../hooks/usePagination';
import { colors } from '../../constants/theme';

const PAGE_SIZE = 6;

const styles = {
  wrapper: 'overflow-hidden rounded-xl bg-white shadow-sm',
  header: `flex items-center gap-3 ${colors.navBackground} px-4 py-2.5 text-xs font-bold uppercase text-white`,
  headerName: 'min-w-0 flex-1',
  headerQuantity: 'w-[4.5rem] shrink-0 text-center',
  headerSubtotal: 'w-24 shrink-0 text-right',
  headerAction: 'w-7 shrink-0',
  body: 'flex flex-col divide-y divide-slate-100',
  row: 'flex flex-wrap items-center gap-3 px-4 py-3',
  info: 'min-w-0 flex-1',
  nameRow: 'flex flex-wrap items-center gap-2',
  name: `font-semibold ${colors.textPrimary}`,
  badgeLocal: 'shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700',
  badgeLlevar: 'shrink-0 rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-700',
  meta: 'text-xs text-slate-500',
  customizationRow: 'mt-0.5 flex items-center gap-1.5',
  customization: 'truncate text-xs font-medium text-orange-600',
  detailLink: 'shrink-0 text-xs font-semibold text-blue-600 hover:underline',
  subtotal: 'w-24 shrink-0 text-right text-sm font-bold text-blue-600',
  removeButton: 'flex shrink-0 items-center justify-center rounded-full bg-red-100 p-1.5 text-red-600 hover:bg-red-200',
  lockedQuantity: 'flex w-[4.5rem] shrink-0 items-center justify-center text-sm font-bold text-slate-700',
  pagination: 'px-4 py-2',
  totalRow: 'flex items-center justify-end gap-3 border-t border-slate-100 px-4 py-3',
  totalLabel: `text-sm font-bold ${colors.textPrimary}`,
  totalValue: 'text-lg font-bold text-red-600',
  empty: 'rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm'
};

const buildCustomizationText = (item) => {
  const parts = [];
  if (item.exclusiones?.length) parts.push(`sin ${item.exclusiones.map((e) => e.nomIng).join(', ')}`);
  if (item.extras?.length) parts.push(`extra ${item.extras.map((e) => `${e.cantidadExtra}x ${e.nomIng}`).join(', ')}`);
  if (item.productCustomizations?.length) {
    item.productCustomizations.forEach((pc) => {
      (pc.unitGroups || []).forEach((group) => {
        if (group.exclusiones?.length) parts.push(`${pc.nombre} (${group.cantidad}x) sin ${group.exclusiones.map((e) => e.nomIng).join(', ')}`);
        if (group.extras?.length) parts.push(`${pc.nombre} (${group.cantidad}x) extra ${group.extras.map((e) => `${e.cantidadExtra}x ${e.nomIng}`).join(', ')}`);
      });
    });
  }
  return parts.join(' | ');
};

const hasPerUnitCustomization = (item) =>
  item.type === 'promotion' && item.productCustomizations?.some((pc) => pc.unitGroups?.length > 0);

export const PosCartList = ({ items, onRemove, onUpdateQuantity, total }) => {
  const [detailItem, setDetailItem] = useState(null);
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(items, PAGE_SIZE);

  if (items.length === 0) {
    return <p className={styles.empty}>Aún no agregaste productos</p>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerName}>Producto</span>
        <span className={styles.headerQuantity}>Cant.</span>
        <span className={styles.headerSubtotal}>Subtotal</span>
        <span className={styles.headerAction} />
      </div>
      <div className={styles.body}>
        {visible.map((item) => {
          const customization = buildCustomizationText(item);
          const hasCustomization = Boolean(customization);
          const locked = hasPerUnitCustomization(item);

          return (
            <div key={item.cartId} className={styles.row}>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <p className={styles.name}>{item.nombre} {item.type === 'promotion' && '(Promo)'}</p>
                  <span className={item.tipoConsumo === 'Local' ? styles.badgeLocal : styles.badgeLlevar}>
                    {item.tipoConsumo === 'Local' ? 'Local' : 'Llevar'}
                  </span>
                </div>
                <p className={styles.meta}>Bs {item.unitPrice.toFixed(2)} c/u</p>
                {hasCustomization && (
                  <div className={styles.customizationRow}>
                    <p className={styles.customization}>{customization}</p>
                    <button type="button" className={styles.detailLink} onClick={() => setDetailItem(item)}>
                      Ver detalle
                    </button>
                  </div>
                )}
              </div>

              {locked ? (
                <span className={styles.lockedQuantity}>{item.cantidad}</span>
              ) : (
                <TextInput
                  value={item.cantidad}
                  onChange={(event) => onUpdateQuantity(item.cartId, event.target.value.replace(/\D/g, ''))}
                  maxLength={3}
                  style={{ width: '4.5rem' }}
                />
              )}

              <span className={styles.subtotal}>Bs {(item.unitPrice * Number(item.cantidad || 0)).toFixed(2)}</span>
              <button type="button" className={styles.removeButton} onClick={() => onRemove(item.cartId)}>
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      {items.length > PAGE_SIZE && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            canGoLeft={canGoLeft}
            canGoRight={canGoRight}
            onPrev={goLeft}
            onNext={goRight}
          />
        </div>
      )}
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>Bs {total.toFixed(2)}</span>
      </div>
      {detailItem && <OrderItemDetailModal item={detailItem} onClose={() => setDetailItem(null)} />}
    </div>
  );
};