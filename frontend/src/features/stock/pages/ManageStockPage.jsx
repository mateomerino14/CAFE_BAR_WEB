import { useState } from 'react';
import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { StockTable } from '../../../components/organisms/StockTable';
import { StockEditModal } from '../../../components/organisms/StockEditModal';
import { Toast } from '../../../components/atoms/Toast';
import { useStockList } from '../hooks/useStockList';
import { usePagination } from '../../../hooks/usePagination';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';

const PAGE_SIZE = 8;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const ManageStockPage = () => {
  const { search, setSearch, items, names, handleSearch, handleSelectSuggestion, editingItem, openEdit, closeEdit, refresh } = useStockList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(items, PAGE_SIZE);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  const handleSaved = () => {
    setSuccess('Ingrediente modificado exitosamente');
    closeEdit();
    refresh();
  };
  return (
    <>
      <MainLayout title="MODIFICAR INGREDIENTES">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <StockTable items={visible} onEdit={openEdit} />
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
      {editingItem && <StockEditModal item={editingItem} onClose={closeEdit} onSaved={handleSaved} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};