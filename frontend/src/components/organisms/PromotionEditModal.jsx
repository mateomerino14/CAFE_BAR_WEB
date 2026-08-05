import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { PromotionFormFields } from './PromotionFormFields';
import { PromotionScheduleFields } from './PromotionScheduleFields';
import { PromotionProductPicker } from './PromotionProductPicker';
import { PromotionProductsStagingList } from './PromotionProductsStagingList';
import { useEditPromotion } from '../../features/promotions/hooks/useEditPromotion';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  actions: 'mt-4 flex flex-col gap-2'
};

export const PromotionEditModal = ({ promotion, onClose, onSaved }) => {
  const {
    values, updateField, schedule, updateSchedule, days, toggleDay,
    preview, handleFileChange, staging, handleAddProduct,
    ready, error, loading, handleSave
  } = useEditPromotion(promotion, onSaved);

  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar promoción</p>
        <h2 className={styles.title}>{promotion.nom_prom}</h2>
      </div>
      {ready && (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PromotionFormFields values={values} onChange={updateField} photoPreview={preview} onPhotoChange={handleFileChange} />
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