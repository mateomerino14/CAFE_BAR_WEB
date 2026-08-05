import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { RoleTable } from '../../../components/organisms/RoleTable';
import { RoleEditModal } from '../../../components/organisms/RoleEditModal';
import { Toast } from '../../../components/atoms/Toast';
import { useRolesList } from '../hooks/useRolesList';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const ManageRolesPage = () => {
  const {
    search,
    setSearch,
    roles,
    names,
    handleSearch,
    handleSelectSuggestion,
    editingRole,
    openEdit,
    closeEdit,
    success,
    handleSaved
  } = useRolesList();

  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(roles, PAGE_SIZE);

  return (
    <>
      <MainLayout title="MODIFICAR CARGOS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre de cargo"
          />
          <RoleTable roles={visible} onEdit={openEdit} />
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
      {editingRole && <RoleEditModal role={editingRole} onClose={closeEdit} onSaved={handleSaved} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};