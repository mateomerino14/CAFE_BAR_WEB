import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { EmployeeStatusTable } from '../../../components/organisms/EmployeeStatusTable';
import { Toast } from '../../../components/atoms/Toast';
import { useEmployeeStatusList } from '../hooks/useEmployeeStatusList';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const EmployeeStatusPage = () => {
  const { search, setSearch, employees, names, handleSearch, handleSelectSuggestion, handleToggle, success, error } = useEmployeeStatusList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(employees, PAGE_SIZE);
  return (
    <>
      <MainLayout title="DAR DE BAJA EMPLEADOS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <EmployeeStatusTable employees={visible} onToggle={handleToggle} />
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