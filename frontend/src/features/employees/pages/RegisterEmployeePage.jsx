import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { TextInput } from '../../../components/atoms/TextInput';
import { PasswordField } from '../../../components/molecules/PasswordField';
import { FormField } from '../../../components/molecules/FormField';
import { Toast } from '../../../components/atoms/Toast';
import { EmployeeFormFields } from '../../../components/organisms/EmployeeFormFields';
import { useRegisterEmployee } from '../hooks/useRegisterEmployee';

const styles = {
  card: 'mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-xl bg-white p-6 shadow-sm',
  actions: 'flex flex-col gap-3 sm:flex-row'
};

export const RegisterEmployeePage = () => {
  const {
    step,
    values,
    updateField,
    alias,
    setAlias,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    cargoOptions,
    preview,
    handleFileChange,
    error,
    success,
    loading,
    handleNextStep,
    handleBack,
    handleSubmit
  } = useRegisterEmployee();

  return (
    <>
      <MainLayout title="REGISTRAR EMPLEADOS">
        <div className={styles.card}>
          {step === 'personal' && (
            <form onSubmit={handleNextStep} className="flex flex-col gap-6">
              <EmployeeFormFields
                values={values}
                onChange={updateField}
                cargoOptions={cargoOptions}
                photoPreview={preview}
                onPhotoChange={handleFileChange}
              />
              <Button type="submit">SIGUIENTE</Button>
            </form>
          )}

          {step === 'credentials' && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <FormField label="ALIAS">
                <TextInput value={alias} onChange={(event) => setAlias(event.target.value)} placeholder="Mínimo 4 caracteres" maxLength={30} />
              </FormField>
              <FormField label="CONTRASEÑA">
                <PasswordField value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" />
              </FormField>
              <FormField label="CONFIRMAR CONTRASEÑA">
                <PasswordField value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita la contraseña" />
              </FormField>
              <div className={styles.actions}>
                <Button type="button" variant="danger" className="flex-1" onClick={handleBack}>ATRÁS</Button>
                <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'REGISTRANDO...' : 'REGISTRAR EMPLEADO'}</Button>
              </div>
            </form>
          )}
        </div>
      </MainLayout>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};