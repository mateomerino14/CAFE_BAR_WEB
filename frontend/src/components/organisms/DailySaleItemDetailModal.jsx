import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-blue-200',
  title: 'text-lg font-bold text-white',
  row: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  label: 'font-semibold text-slate-700',
  section: 'mt-3',
  sectionTitle: 'text-sm font-bold text-slate-700',
  sectionList: 'mt-1 flex flex-col gap-2',
  groupCard: 'rounded-lg border border-slate-200 bg-slate-50 p-3',
  groupLabel: 'text-sm font-bold text-slate-700',
  exclusionLine: 'mt-1 text-xs font-semibold text-red-600',
  extraLine: 'mt-1 text-xs font-semibold text-emerald-600',
  back: 'mt-4'
};

export const DailySaleItemDetailModal = ({ item, onClose }) => {
  const grupos = item.personalizacionGrupos || [];

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{item.esPromocion ? 'Promoción' : 'Producto'}</p>
        <h2 className={styles.title}>{item.producto}</h2>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Cantidad</span>
        <span>{item.cantidad}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Tipo de consumo</span>
        <span>{item.tipoConsumo}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Mesero</span>
        <span>{item.mesero}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Estado</span>
        <span>{item.estado}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Subtotal</span>
        <span>Bs {Number(item.subtotal).toFixed(2)}</span>
      </div>
      {grupos.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Personalización</p>
          <div className={styles.sectionList}>
            {grupos.map((g, index) => (
              <div key={index} className={styles.groupCard}>
                {(g.cantidad !== null || g.producto) && (
                  <p className={styles.groupLabel}>
                    {g.cantidad !== null && `(${g.cantidad}x) `}{g.producto || ''}
                  </p>
                )}
                {g.exclusiones.length > 0 && <p className={styles.exclusionLine}>Sin: {g.exclusiones.join(', ')}</p>}
                {g.extras.length > 0 && <p className={styles.extraLine}>Extra: {g.extras.join(', ')}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
    </Modal>
  );
};