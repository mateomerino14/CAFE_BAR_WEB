import {useState} from 'react';
import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {DailySaleItemDetailModal} from './DailySaleItemDetailModal';
import {useSaleDetails} from '../../features/config/hooks/useSaleDetails';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-blue-200',
  title: 'text-lg font-bold text-white',
  row: 'flex items-start gap-3 border-b border-slate-100 py-3 last:border-0',
  info: 'min-w-0 flex-1',
  nameRow: 'flex flex-wrap items-center gap-2',
  name: 'font-semibold text-slate-800',
  typeBadge: 'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase',
  typeBadgeLocal: 'bg-blue-100 text-blue-700',
  typeBadgeLlevar: 'bg-orange-100 text-orange-700',
  kindBadge: 'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase',
  kindBadgeProducto: 'bg-slate-100 text-slate-600',
  kindBadgePromo: 'bg-purple-100 text-purple-700',
  meta: 'mt-0.5 text-xs text-slate-500',
  customization: 'mt-1 truncate text-xs font-medium text-orange-600',
  detailLink: 'mt-1 text-xs font-semibold text-blue-600 hover:underline',
  subtotal: 'shrink-0 text-right text-sm font-bold text-blue-600',
  loading: 'mt-4 text-center text-sm text-blue-500',
  back: 'mt-4'
};

const buildSummaryText = (grupos) => {
  return grupos
    .map((g) => {
      const prefix = g.cantidad !== null ? `(${g.cantidad}x)${g.producto ? ` ${g.producto}` : ''}: ` : '';
      const bits = [];
      if (g.exclusiones.length) bits.push(`sin ${g.exclusiones.join(', ')}`);
      if (g.extras.length) bits.push(`extra ${g.extras.join(', ')}`);
      return `${prefix}${bits.join(', ')}`;
    })
    .join(' | ');
};

export const SaleDetailsModal = ({venta, onClose}) => {
  const { details, loading } = useSaleDetails(venta.idVenta);
  const [selectedItem, setSelectedItem] = useState(null);
  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Venta</p>
        <h2 className={styles.title}>N° {venta.numVenta} — {venta.seccion} — Mesa {venta.mesa}</h2>
      </div>
      {loading && <p className={styles.loading}>Cargando...</p>}
      {!loading && details.map((item, index) => {
        const grupos = item.personalizacionGrupos || [];
        const hasCustomization = grupos.length > 0;
        const summary = hasCustomization ? buildSummaryText(grupos) : '';
        return (
          <div key={index} className={styles.row}>
            <div className={styles.info}>
              <div className={styles.nameRow}>
                <span className={`${styles.kindBadge} ${item.esPromocion ? styles.kindBadgePromo : styles.kindBadgeProducto}`}>
                  {item.esPromocion ? 'Promo' : 'Producto'}
                </span>
                <p className={styles.name}>{item.cantidad}x {item.producto}</p>
                <span className={`${styles.typeBadge} ${item.tipoConsumo === 'Local' ? styles.typeBadgeLocal : styles.typeBadgeLlevar}`}>
                  {item.tipoConsumo === 'Local' ? 'Local' : 'Llevar'}
                </span>
              </div>
              <p className={styles.meta}>{item.mesero} — {item.estado}</p>
              {hasCustomization && <p className={styles.customization}>{summary}</p>}
              {hasCustomization && (
                <button type="button" className={styles.detailLink} onClick={() => setSelectedItem(item)}>
                  Ver detalle
                </button>
              )}
            </div>
            <span className={styles.subtotal}>Bs {Number(item.subtotal).toFixed(2)}</span>
          </div>
        );
      })}
      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
      {selectedItem && <DailySaleItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </Modal>
  );
};