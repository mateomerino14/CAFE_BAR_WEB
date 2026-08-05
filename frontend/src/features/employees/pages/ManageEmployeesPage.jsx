import { useState } from 'react';
import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { EmployeeTable } from '../../../components/organisms/EmployeeTable';
import { EmployeeEditModal } from '../../../components/organisms/EmployeeEditModal';
import { Toast } from '../../../components/atoms/Toast';
import { useEmployeesList } from '../hooks/useEmployeesList';
import { usePagination } from '../../../hooks/usePagination';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const ManageEmployeesPage = () => {
  const { search, setSearch, employees, names, handleSearch, handleSelectSuggestion, editingEmployee, openEdit, closeEdit, refresh } = useEmployeesList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(employees, PAGE_SIZE);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));

  const handleSaved = () => {
    setSuccess('Se ha registrado con éxito la modificación');
    closeEdit();
    refresh();
  };

  return (
    <>
      <MainLayout title="MODIFICAR EMPLEADOS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <EmployeeTable employees={visible} onEdit={openEdit} />
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
      {editingEmployee && <EmployeeEditModal employee={editingEmployee} onClose={closeEdit} onSaved={handleSaved} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};