import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { usePendingOrders } from '../../features/pos/hooks/usePendingOrders';
import { MarkCardsModal } from './MarkCardsModal';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  list: 'mt-4 flex flex-col gap-3',
  batch: 'rounded-lg border border-slate-200 p-3',
  header: 'flex cursor-pointer items-center justify-between',
  time: 'text-xs font-bold',
  recent: 'text-emerald-600',
  waiting: 'text-orange-500',
  urgent: 'text-red-600',
  preview: 'mt-2 text-sm text-slate-600',
  itemsList: 'mt-2 flex flex-col gap-1 border-t border-slate-100 pt-2 text-sm',
  markButton: 'mt-3',
  empty: 'mt-4 text-center text-sm text-slate-400',
  loading: 'mt-4 text-center text-sm font-semibold text-blue-500',
  back: 'mt-4'
};

const VARIANT_CLASS = { recent: styles.recent, waiting: styles.waiting, urgent: styles.urgent };

export const PendingOrdersModal = ({ seccion, mesa, onClose }) => {
  const { batches, loading, expandedFecha, toggleExpand, markingFecha, openMarking, closeMarking, getElapsedStatus } = usePendingOrders(seccion, mesa, true);

  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>Pedidos pendientes — Mesa {mesa.id_mesa}</h2>
      {loading && <p className={styles.loading}>Cargando pedidos pendientes...</p>}
      {!loading && batches.length === 0 && <p className={styles.empty}>No hay pedidos pendientes para esta mesa</p>}
      {!loading && (
        <div className={styles.list}>
          {batches.map((batch) => {
            const status = getElapsedStatus(batch.fecha);
            const isExpanded = expandedFecha === batch.fecha;
            return (
              <div key={batch.fecha} className={styles.batch}>
                <div className={styles.header} onClick={() => toggleExpand(batch.fecha)}>
                  <span className={`${styles.time} ${VARIANT_CLASS[status.variant]}`}>{status.label}</span>
                  <span>{isExpanded ? '▲' : '▼'}</span>
                </div>
                {!isExpanded && (
                  <p className={styles.preview}>
                    {batch.items.slice(0, 3).map((item) => `${item.restante}/${item.total} ${item.nombre}`).join(' · ')}
                    {batch.items.length > 3 && ` +${batch.items.length - 3} más`}
                  </p>
                )}
                {isExpanded && (
                  <div className={styles.itemsList}>
                    {batch.items.map((item, index) => (
                      <p key={index}>[{item.tipo}] {item.restante}/{item.total} x {item.nombre}</p>
                    ))}
                  </div>
                )}
                <Button type="button" variant="warning" size="sm" className={styles.markButton} onClick={() => openMarking(batch.fecha)}>
                  MARCAR PENDIENTES
                </Button>
              </div>
            );
          })}
        </div>
      )}
      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
      {markingFecha && <MarkCardsModal fecha={markingFecha} onClose={closeMarking} />}
    </Modal>
  );
};