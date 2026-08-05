import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { SubcategoryManageList } from './SubcategoryManageList';
import { AddSubcategoryForm } from './AddSubcategoryForm';
import { SubcategoryEditModal } from './SubcategoryEditModal';
import { useManageSubcategories } from '../../features/categories/hooks/useManageSubcategories';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  divider: 'my-5 border-t border-slate-200',
  closeAction: 'mt-4'
};

export const ManageSubcategoriesModal = ({ category, onClose }) => {
  const {
    subcategories,
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
      <SubcategoryManageList subcategories={subcategories} onEdit={openEdit} onToggle={handleToggle} />
      <div className={styles.divider} />
      {!showAdd && <Button type="button" onClick={() => setShowAdd(true)}>AÑADIR SUBCATEGORÍA</Button>}
      {showAdd && (
        <AddSubcategoryForm
          categoryId={category.id_categoria}
          onAdded={() => {
            handleAdded();
            setShowAdd(false);
          }}
        />
      )}
      <Button type="button" variant="danger" className={styles.closeAction} onClick={onClose}>CERRAR</Button>
      {editingSubcategory && (
        <SubcategoryEditModal subcategory={editingSubcategory} onClose={closeEdit} onSaved={handleEdited} />
      )}
      {success && <Toast variant="success">{success}</Toast>}
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};