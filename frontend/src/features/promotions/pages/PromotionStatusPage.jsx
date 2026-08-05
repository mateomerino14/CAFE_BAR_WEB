import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { PromotionStatusTable } from '../../../components/organisms/PromotionStatusTable';
import { Toast } from '../../../components/atoms/Toast';
import { usePromotionStatusList } from '../hooks/usePromotionStatusList';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 4;
const styles = { wrapper: 'flex flex-col gap-4' };

export const PromotionStatusPage = () => {
  const { search, setSearch, promotions, names, handleSearch, handleSelectSuggestion, handleToggle, success, error } = usePromotionStatusList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(promotions, PAGE_SIZE);

  return (
    <>
      <MainLayout title="DAR DE BAJA PROMOCIONES">
        <div className={styles.wrapper}>
          <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onSubmit={handleSearch} onSelectSuggestion={handleSelectSuggestion} suggestions={names} placeholder="Buscar por nombre" />
          <PromotionStatusTable promotions={visible} onToggle={handleToggle} />
          <Pagination currentPage={currentPage} totalPages={totalPages} canGoLeft={canGoLeft} canGoRight={canGoRight} onPrev={goLeft} onNext={goRight} />
        </div>
      </MainLayout>
      {success && <Toast variant="success">{success}</Toast>}
      {error && <Toast>{error}</Toast>}
    </>
  );
};