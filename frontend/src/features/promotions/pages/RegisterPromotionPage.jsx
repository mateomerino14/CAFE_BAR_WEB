import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { Toast } from '../../../components/atoms/Toast';
import { PromotionFormFields } from '../../../components/organisms/PromotionFormFields';
import { PromotionScheduleFields } from '../../../components/organisms/PromotionScheduleFields';
import { PromotionProductPicker } from '../../../components/organisms/PromotionProductPicker';
import { PromotionProductsStagingList } from '../../../components/organisms/PromotionProductsStagingList';
import { useRegisterPromotion } from '../hooks/useRegisterPromotion';

const styles = { card: 'mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl bg-white p-6 shadow-sm' };

export const RegisterPromotionPage = () => {
  const {
    values, updateField, schedule, updateSchedule, days, toggleDay,
    photoPreview, handleFileChange, staging, handleAddProduct,
    error, success, loading, handleSubmit
  } = useRegisterPromotion();

  return (
    <>
      <MainLayout title="REGISTRAR PROMOCIONES">
        <form onSubmit={handleSubmit} className={styles.card}>
          <PromotionFormFields values={values} onChange={updateField} photoPreview={photoPreview} onPhotoChange={handleFileChange} />
          <PromotionScheduleFields schedule={schedule} onChange={updateSchedule} days={days} onToggleDay={toggleDay} />
          <PromotionProductPicker
            productInput={staging.productInput}
            onInputChange={staging.handleInputChange}
            onSelect={staging.handleSelectProduct}
            quantity={staging.quantity}
            onQuantityChange={(value) => staging.setQuantity(value.replace(/\D/g, ''))}
            onAdd={handleAddProduct}
          />
          <PromotionProductsStagingList items={staging.items} onRemove={staging.handleRemove} onUpdateQuantity={staging.handleUpdateQuantity} total={staging.total} />
          <Button type="submit" disabled={loading}>{loading ? 'REGISTRANDO...' : 'REGISTRAR PROMOCIÓN'}</Button>
        </form>
      </MainLayout>
      {(error || staging.error) && <Toast>{error || staging.error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};