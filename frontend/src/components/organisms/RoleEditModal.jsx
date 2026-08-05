import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { PermissionsSelector } from './PermissionsSelector';
import { useEditRole } from '../../features/roles/hooks/useEditRole';
import { colors } from '../../constants/theme';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  actions: 'mt-4 flex flex-col gap-2'
};

export const RoleEditModal = ({ role, onClose, onSaved }) => {
  const { screens, selectedIds, toggle, selectAllInScreen, selectNoneInScreen, error, loading, ready, handleSave } = useEditRole(role, onSaved);

  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar cargo</p>
        <h2 className={styles.title}>{role.nom_carg}</h2>
      </div>
      {ready && (
        <PermissionsSelector
          screens={screens}
          selectedIds={selectedIds}
          onToggle={toggle}
          onSelectAllInScreen={selectAllInScreen}
          onSelectNoneInScreen={selectNoneInScreen}
        />
      )}
      <div className={styles.actions}>
        <Button type="button" onClick={handleSave} disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Button>
        <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
      </div>
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};