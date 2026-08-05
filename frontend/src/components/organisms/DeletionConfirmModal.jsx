import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-red-600 to-red-800 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-red-100',
  title: 'text-lg font-bold text-white',
  section: 'mt-3',
  sectionTitle: 'text-sm font-bold text-slate-700',
  list: 'mt-1 flex flex-col gap-1',
  item: 'rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700',
  warning: 'mt-4 rounded-lg bg-red-100 p-3 text-center text-sm font-bold text-red-800',
  actions: 'mt-4 flex flex-col gap-2'
};

export const DeletionConfirmModal = ({ tree, totalSelected, executing, onConfirm, onCancel }) => {
  return (
    <Modal onClose={onCancel} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Confirmación requerida</p>
        <h2 className={styles.title}>Eliminar {totalSelected} registro(s) permanentemente</h2>
      </div>

      {tree?.empleados?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Empleados que también se eliminarán (por cargo)</p>
          <div className={styles.list}>
            {tree.empleados.map((e) => <p key={e.id} className={styles.item}>{e.nombre}</p>)}
          </div>
        </div>
      )}

      {tree?.mesas?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Mesas que también se eliminarán</p>
          <div className={styles.list}>
            {tree.mesas.map((m) => <p key={m.id} className={styles.item}>{m.nombre}</p>)}
          </div>
        </div>
      )}

      {tree?.ventas?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Ventas que también se eliminarán</p>
          <div className={styles.list}>
            {tree.ventas.slice(0, 20).map((v) => <p key={v.id} className={styles.item}>{v.nombre}</p>)}
            {tree.ventas.length > 20 && <p className={styles.item}>... y {tree.ventas.length - 20} más</p>}
          </div>
        </div>
      )}

      <div className={styles.warning}>Esta acción NO se puede deshacer</div>

      <div className={styles.actions}>
        <Button type="button" variant="danger" onClick={onConfirm} disabled={executing}>
          {executing ? 'ELIMINANDO...' : 'SÍ, ELIMINAR PERMANENTEMENTE'}
        </Button>
        <Button type="button" onClick={onCancel}>CANCELAR</Button>
      </div>
    </Modal>
  );
};