import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { ProductFormFields } from './ProductFormFields';
import { IngredientPicker } from './IngredientPicker';
import { IngredientStagingList } from './IngredientStagingList';
import { useEditProduct } from '../../features/products/hooks/useEditProduct';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  actions: 'mt-4 flex flex-col gap-2'
};

export const ProductEditModal = ({ product, onClose, onSaved }) => {
  const {
    values,
    updateField,
    preview,
    handleFileChange,
    categoryOptions,
    subcategoryOptions,
    stockOptions,
    staging,
    handleAddIngredient,
    ready,
    error,
    loading,
    handleSave
  } = useEditProduct(product, onSaved);

  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar producto</p>
        <h2 className={styles.title}>{product.nom_prod}</h2>
      </div>
      {ready && (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <ProductFormFields
            values={values}
            onChange={updateField}
            categoryOptions={categoryOptions}
            subcategoryOptions={subcategoryOptions}
            photoPreview={preview}
            onPhotoChange={handleFileChange}
          />
          <IngredientPicker
            ingredientInput={staging.ingredientInput}
            onInputChange={staging.handleInputChange}
            options={stockOptions}
            onSelect={staging.handleSelectIngredient}
            quantity={staging.quantity}
            onQuantityChange={staging.setQuantity}
            onAdd={handleAddIngredient}
          />
          <IngredientStagingList items={staging.items} onRemove={staging.handleRemove} onUpdateQuantity={staging.handleUpdateQuantity} />
          <div className={styles.actions}>
            <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Button>
            <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
          </div>
        </form>
      )}
      {(error || staging.error) && <Toast>{error || staging.error}</Toast>}
    </Modal>
  );
};