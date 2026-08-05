import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { Toast } from '../../../components/atoms/Toast';
import { StockFormFields } from '../../../components/organisms/StockFormFields';
import { useRegisterStock } from '../hooks/useRegisterStock';

const styles = {
  card: 'mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-xl bg-white p-6 shadow-sm'
};

export const RegisterStockPage = () => {
  const { values, updateField, isDuplicateName, error, success, loading, handleSubmit } = useRegisterStock();
  return (
    <>
      <MainLayout title="REGISTRAR INGREDIENTES">
        <form onSubmit={handleSubmit} className={styles.card}>
          <StockFormFields values={values} onChange={updateField} isDuplicateName={isDuplicateName} />
          <Button type="submit" disabled={loading}>{loading ? 'REGISTRANDO...' : 'CONFIRMAR'}</Button>
        </form>
      </MainLayout>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};