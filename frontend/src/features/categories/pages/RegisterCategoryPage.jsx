import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { TextInput } from '../../../components/atoms/TextInput';
import { Toast } from '../../../components/atoms/Toast';
import { FormField } from '../../../components/molecules/FormField';
import { ImagePicker } from '../../../components/molecules/ImagePicker';
import { SubcategoryStagingList } from '../../../components/organisms/SubcategoryStagingList';
import { useRegisterCategory } from '../hooks/useRegisterCategory';

const styles = {
  wrapper: 'mx-auto flex w-full max-w-4xl flex-col gap-6',
  grid: 'grid grid-cols-1 gap-6 sm:grid-cols-2',
  card: 'flex flex-col items-center gap-4 rounded-xl bg-white p-6 shadow-sm',
  cardTitle: 'text-sm font-bold uppercase tracking-wide text-blue-600',
  subcardTitle: 'text-sm font-bold uppercase tracking-wide text-orange-500',
  subForm: 'flex w-full flex-col items-center gap-3',
  subFormActions: 'flex flex-wrap justify-center gap-2'
};

export const RegisterCategoryPage = () => {
  const {
    categoryName,
    setCategoryName,
    categoryPreview,
    handleCategoryPhotoChange,
    subcategoryName,
    setSubcategoryName,
    subcategoryPreview,
    handleSubcategoryPhotoChange,
    subcategories,
    editingId,
    isEditing,
    handleAddSubcategory,
    handleRemoveSubcategory,
    handleStartEdit,
    handleCancelEdit,
    error,
    success,
    loading,
    handleSubmit
  } = useRegisterCategory();

  return (
    <>
      <MainLayout title="REGISTRAR CATEGORÍAS">
        <form onSubmit={handleSubmit} className={styles.wrapper}>
          <div className={styles.grid}>
            <div className={styles.card}>
              <span className={styles.cardTitle}>Categoría</span>
              <ImagePicker src={categoryPreview} alt="Imagen de categoría" onFileChange={handleCategoryPhotoChange} />
              <FormField label="NOMBRE">
                <TextInput value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Nombre de la categoría" maxLength={30} />
              </FormField>
            </div>
            <div className={styles.card}>
              <span className={styles.subcardTitle}>{isEditing ? 'Editando subcategoría' : 'Subcategoría'}</span>
              <ImagePicker src={subcategoryPreview} alt="Imagen de subcategoría" onFileChange={handleSubcategoryPhotoChange} />
              <div className={styles.subForm}>
                <FormField label="NOMBRE">
                  <TextInput value={subcategoryName} onChange={(event) => setSubcategoryName(event.target.value)} placeholder="Nombre de la subcategoría" maxLength={50} />
                </FormField>
                <div className={styles.subFormActions}>
                  <Button type="button" onClick={handleAddSubcategory}>{isEditing ? 'GUARDAR CAMBIOS' : 'AÑADIR'}</Button>
                  {isEditing && <Button type="button" variant="danger" onClick={handleCancelEdit}>CANCELAR EDICIÓN</Button>}
                </div>
              </div>
            </div>
          </div>
          <SubcategoryStagingList items={subcategories} onRemove={handleRemoveSubcategory} onEdit={handleStartEdit} editingId={editingId} />
          <Button type="submit" disabled={loading}>{loading ? 'REGISTRANDO...' : 'REGISTRAR'}</Button>
        </form>
      </MainLayout>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};