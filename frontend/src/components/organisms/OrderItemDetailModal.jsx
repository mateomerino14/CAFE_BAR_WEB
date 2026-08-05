import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white',
  row: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  label: 'font-semibold text-slate-700',
  section: 'mt-3',
  sectionTitle: 'text-sm font-bold text-slate-700',
  sectionBody: 'mt-1 text-sm text-slate-600',
  productBlock: 'mt-3 rounded-lg border border-slate-200 p-3',
  productName: 'text-sm font-bold text-slate-800',
  groupRow: 'mt-1 text-xs text-slate-600',
  back: 'mt-4'
};

export const OrderItemDetailModal = ({ item, onClose }) => {
  return (
    <Modal onClose={onClose} hideCloseButton>
      <div className={styles.header}>
        <p className={styles.eyebrow}>{item.type === 'promotion' ? 'Promoción' : 'Producto'}</p>
        <h2 className={styles.title}>{item.nombre}</h2>
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
        <span className={styles.label}>Precio unitario</span>
        <span>Bs {item.unitPrice.toFixed(2)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Subtotal</span>
        <span>Bs {(item.unitPrice * Number(item.cantidad || 0)).toFixed(2)}</span>
      </div>

      {item.exclusiones?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Sin ingredientes</p>
          <p className={styles.sectionBody}>{item.exclusiones.map((e) => e.nomIng).join(', ')}</p>
        </div>
      )}
      {item.extras?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Extras</p>
          <p className={styles.sectionBody}>{item.extras.map((e) => `+${e.cantidadExtra} ${e.nomIng}`).join(', ')}</p>
        </div>
      )}

      {item.productCustomizations?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Personalización por producto</p>
          {item.productCustomizations.map((pc) => (
            <div key={pc.idProd} className={styles.productBlock}>
              <p className={styles.productName}>{pc.nombre}</p>
              {pc.unitGroups.map((group, index) => (
                <p key={index} className={styles.groupRow}>
                  {group.cantidad}x —{' '}
                  {[
                    group.exclusiones.length ? `sin ${group.exclusiones.map((e) => e.nomIng).join(', ')}` : '',
                    group.extras.length ? `extra ${group.extras.map((e) => `${e.cantidadExtra}x ${e.nomIng}`).join(', ')}` : ''
                  ].filter(Boolean).join(' | ') || 'sin personalizar'}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
    </Modal>
  );
};