import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { CategoryTable } from '../../../components/organisms/CategoryTable';
import { CategoryEditModal } from '../../../components/organisms/CategoryEditModal';
import { ManageSubcategoriesModal } from '../../../components/organisms/ManageSubcategoriesModal';
import { Toast } from '../../../components/atoms/Toast';
import { useCategoriesList } from '../hooks/useCategoriesList';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const ManageCategoriesPage = () => {
  const {
    search,
    setSearch,
    categories,
    names,
    handleSearch,
    handleSelectSuggestion,
    editingCategory,
    openEdit,
    closeEdit,
    managingCategory,
    openManage,
    closeManage,
    success,
    handleSaved
  } = useCategoriesList();

  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(categories, PAGE_SIZE);

  return (
    <>
      <MainLayout title="MODIFICAR CATEGORÍAS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <CategoryTable categories={visible} onEdit={openEdit} onManage={openManage} />
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
      {editingCategory && <CategoryEditModal category={editingCategory} onClose={closeEdit} onSaved={handleSaved} />}
      {managingCategory && <ManageSubcategoriesModal category={managingCategory} onClose={closeManage} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};