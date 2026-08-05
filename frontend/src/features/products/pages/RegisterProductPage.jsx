import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { Toast } from '../../../components/atoms/Toast';
import { ProductFormFields } from '../../../components/organisms/ProductFormFields';
import { IngredientPicker } from '../../../components/organisms/IngredientPicker';
import { IngredientStagingList } from '../../../components/organisms/IngredientStagingList';
import { useRegisterProduct } from '../hooks/useRegisterProduct';

const styles = {
  card: 'mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl bg-white p-6 shadow-sm'
};

export const RegisterProductPage = () => {
  const {
    values,
    updateField,
    photoPreview,
    handleFileChange,
    categoryOptions,
    subcategoryOptions,
    stockOptions,
    staging,
    handleAddIngredient,
    error,
    success,
    loading,
    handleSubmit
  } = useRegisterProduct();

  return (
    <>
      <MainLayout title="REGISTRAR PRODUCTOS">
        <form onSubmit={handleSubmit} className={styles.card}>
          <ProductFormFields
            values={values}
            onChange={updateField}
            categoryOptions={categoryOptions}
            subcategoryOptions={subcategoryOptions}
            photoPreview={photoPreview}
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
          <Button type="submit" disabled={loading}>{loading ? 'REGISTRANDO...' : 'REGISTRAR PRODUCTO'}</Button>
        </form>
      </MainLayout>
      {(error || staging.error) && <Toast>{error || staging.error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};