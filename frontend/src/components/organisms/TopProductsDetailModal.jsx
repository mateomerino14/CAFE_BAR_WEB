import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-blue-100',
  title: 'text-lg font-bold text-white',
  row: 'flex items-center justify-between border-b border-slate-100 py-2 text-sm last:border-0',
  label: 'font-semibold text-slate-700',
  gananciaPositiva: 'font-bold text-emerald-600',
  gananciaNegativa: 'font-bold text-red-600',
  section: 'mt-3',
  sectionTitle: 'text-sm font-bold text-slate-700',
  chipsWrapper: 'mt-2 flex flex-wrap gap-2',
  chip: 'rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700',
  back: 'mt-4'
};

export const TopProductsDetailModal = ({ item, onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Promoción</p>
        <h2 className={styles.title}>{item.nombre}</h2>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Cantidad vendida</span>
        <span>{item.cantidad}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Ingreso</span>
        <span>Bs {item.ingreso.toFixed(2)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Costo estimado</span>
        <span>Bs {item.costo.toFixed(2)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Ganancia</span>
        <span className={item.ganancia >= 0 ? styles.gananciaPositiva : styles.gananciaNegativa}>Bs {item.ganancia.toFixed(2)}</span>
      </div>

      {item.productosConsumidos?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Productos consumidos</p>
          <div className={styles.chipsWrapper}>
            {item.productosConsumidos.map((pc, index) => (
              <span key={index} className={styles.chip}>{pc.cantidad}x {pc.nombre}</span>
            ))}
          </div>
        </div>
      )}

      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
    </Modal>
  );
};