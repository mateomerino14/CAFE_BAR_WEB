import {useState} from 'react';
import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {Toast} from '../atoms/Toast';
import {SubcategoryManageList} from './SubcategoryManageList';
import {AddSubcategoryForm} from './AddSubcategoryForm';
import {SubcategoryEditModal} from './SubcategoryEditModal';
import {useManageSubcategories} from '../../features/categories/hooks/useManageSubcategories';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  divider: 'my-5 border-t border-slate-200',
  actionsRow: 'mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between',
  loading: 'rounded-xl bg-slate-50 p-6 text-center text-sm font-semibold text-blue-500',
  empty: 'rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400'
};

export const ManageSubcategoriesModal = ({category, onClose}) => {
  const {
    subcategories,
    loading,
    handleToggle,
    editingSubcategory,
    openEdit,
    closeEdit,
    handleAdded,
    handleEdited,
    success,
    error
  } = useManageSubcategories(category.id_categoria);
  const [showAdd, setShowAdd] = useState(false);
  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Subcategorías de</p>
        <h2 className={styles.title}>{category.nombre_categoria}</h2>
      </div>
      {loading && <p className={styles.loading}>Cargando subcategorías...</p>}
      {!loading && subcategories.length === 0 && (
        <p className={styles.empty}>Esta categoría todavía no tiene subcategorías registradas</p>
      )}
      {!loading && subcategories.length > 0 && (
        <SubcategoryManageList subcategories={subcategories} onEdit={openEdit} onToggle={handleToggle} />
      )}
      <div className={styles.divider} />
      {showAdd && (
        <AddSubcategoryForm
          categoryId={category.id_categoria}
          onAdded={() => {
            handleAdded();
            setShowAdd(false);
          }}
        />
      )}
      <div className={styles.actionsRow}>
        <Button type="button" variant="danger" onClick={onClose}>CERRAR</Button>
        {!showAdd && <Button type="button" onClick={() => setShowAdd(true)}>AÑADIR SUBCATEGORÍA</Button>}
      </div>
      {editingSubcategory && (
        <SubcategoryEditModal subcategory={editingSubcategory} onClose={closeEdit} onSaved={handleEdited} />
      )}
      {success && <Toast variant="success">{success}</Toast>}
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};