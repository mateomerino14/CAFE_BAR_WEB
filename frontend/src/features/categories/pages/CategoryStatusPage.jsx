import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { CategoryStatusTable } from '../../../components/organisms/CategoryStatusTable';
import { Toast } from '../../../components/atoms/Toast';
import { useCategoryStatusList } from '../hooks/useCategoryStatusList';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const CategoryStatusPage = () => {
  const { search, setSearch, categories, names, handleSearch, handleSelectSuggestion, handleToggle, success, error } = useCategoryStatusList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(categories, PAGE_SIZE);

  return (
    <>
      <MainLayout title="DAR DE BAJA CATEGORÍAS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <CategoryStatusTable categories={visible} onToggle={handleToggle} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            canGoLeft={canGoLeft}
            canGoRight={canGoRight}
            onPrev={goLeft}
            onNext={goRight}
          />
        </div>
      </MainLayout>
      {success && <Toast variant="success">{success}</Toast>}
      {error && <Toast>{error}</Toast>}
    </>
  );
};