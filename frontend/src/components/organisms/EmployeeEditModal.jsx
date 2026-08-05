import { useState } from 'react';
import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { PasswordField } from '../molecules/PasswordField';
import { FormField } from '../molecules/FormField';
import { EmployeeFormFields } from './EmployeeFormFields';
import { useEditEmployee } from '../../features/employees/hooks/useEditEmployee';
import { useResetPassword } from '../../features/employees/hooks/useResetPassword';
import { colors } from '../../constants/theme';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  actions: 'mt-4 flex flex-col gap-2',
  divider: 'my-5 border-t border-slate-200',
  resetTitle: `text-sm font-bold ${colors.textPrimary}`
};

export const EmployeeEditModal = ({ employee, onClose, onSaved }) => {
  const { values, updateField, cargoOptions, preview, handleFileChange, error, loading, handleSave } = useEditEmployee(employee, onSaved);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error: resetError,
    success: resetSuccess,
    loading: resetLoading,
    handleSubmit: handleResetSubmit
  } = useResetPassword(employee.cod_emp, () => setShowResetPassword(false));
  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Modificar empleado</p>
        <h2 className={styles.title}>{employee.alias_emp}</h2>
      </div>
      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <EmployeeFormFields
          values={values}
          onChange={updateField}
          cargoOptions={cargoOptions}
          photoPreview={preview}
          onPhotoChange={handleFileChange}
        />
        <div className={styles.actions}>
          <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}</Button>
          <Button type="button" variant="danger" onClick={onClose}>CANCELAR</Button>
        </div>
      </form>
      <div className={styles.divider} />
      {!showResetPassword && (
        <Button type="button" variant="warning" onClick={() => setShowResetPassword(true)}>RESTABLECER CONTRASEÑA</Button>
      )}
      {showResetPassword && (
        <form onSubmit={handleResetSubmit} className="flex flex-col gap-4">
          <p className={styles.resetTitle}>Nueva contraseña</p>
          <FormField label="NUEVA CONTRASEÑA">
            <PasswordField value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Mínimo 6 caracteres" />
          </FormField>
          <FormField label="CONFIRMAR CONTRASEÑA">
            <PasswordField value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita la contraseña" />
          </FormField>
          <div className={styles.actions}>
            <Button type="submit" disabled={resetLoading}>{resetLoading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}</Button>
            <Button type="button" variant="danger" onClick={() => setShowResetPassword(false)}>CANCELAR</Button>
          </div>
        </form>
      )}
      {error && <Toast>{error}</Toast>}
      {resetError && <Toast>{resetError}</Toast>}
      {resetSuccess && <Toast variant="success">{resetSuccess}</Toast>}
    </Modal>
  );
};