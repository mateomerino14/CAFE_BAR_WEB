import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { Toast } from '../../../components/atoms/Toast';
import { FormField } from '../../../components/molecules/FormField';
import { Combobox } from '../../../components/molecules/Combobox';
import { PermissionsSelector } from '../../../components/organisms/PermissionsSelector';
import { useRegisterRole } from '../hooks/useRegisterRole';

const styles = {
  card: 'mx-auto flex w-full max-w-5xl flex-col gap-5 rounded-xl bg-white p-6 shadow-sm'
};

export const RegisterRolePage = () => {
  const {
    name,
    setName,
    screens,
    nameOptions,
    selectedIds,
    toggle,
    selectAllInScreen,
    selectNoneInScreen,
    error,
    success,
    loading,
    handleSubmit
  } = useRegisterRole();

  return (
    <>
      <MainLayout title="REGISTRAR CARGOS">
        <form onSubmit={handleSubmit} className={styles.card}>
          <FormField label="NOMBRE DEL CARGO">
            <Combobox
              value={name}
              onChange={setName}
              options={nameOptions}
              placeholder="Ej. Mesero"
              maxLength={20}
            />
          </FormField>
          <PermissionsSelector
            screens={screens}
            selectedIds={selectedIds}
            onToggle={toggle}
            onSelectAllInScreen={selectAllInScreen}
            onSelectNoneInScreen={selectNoneInScreen}
          />
          <Button type="submit" disabled={loading}>{loading ? 'GUARDANDO...' : 'REGISTRAR CARGO'}</Button>
        </form>
      </MainLayout>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};