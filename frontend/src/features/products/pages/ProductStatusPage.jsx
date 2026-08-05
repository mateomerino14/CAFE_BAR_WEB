import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { ProductStatusTable } from '../../../components/organisms/ProductStatusTable';
import { Toast } from '../../../components/atoms/Toast';
import { useProductStatusList } from '../hooks/useProductStatusList';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const ProductStatusPage = () => {
  const { search, setSearch, products, names, handleSearch, handleSelectSuggestion, handleToggle, success, error } = useProductStatusList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(products, PAGE_SIZE);

  return (
    <>
      <MainLayout title="DAR DE BAJA PRODUCTOS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <ProductStatusTable products={visible} onToggle={handleToggle} />
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