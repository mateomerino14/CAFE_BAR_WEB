import { useState } from 'react';
import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { ProductTable } from '../../../components/organisms/ProductTable';
import { ProductEditModal } from '../../../components/organisms/ProductEditModal';
import { Toast } from '../../../components/atoms/Toast';
import { useProductsList } from '../hooks/useProductsList';
import { usePagination } from '../../../hooks/usePagination';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';

const PAGE_SIZE = 4;

const styles = {
  wrapper: 'flex flex-col gap-4'
};

export const ManageProductsPage = () => {
  const { search, setSearch, products, names, handleSearch, handleSelectSuggestion, editingProduct, openEdit, closeEdit, refresh } = useProductsList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(products, PAGE_SIZE);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));

  const handleSaved = () => {
    setSuccess('Se ha registrado con éxito la modificación');
    closeEdit();
    refresh();
  };

  return (
    <>
      <MainLayout title="MODIFICAR PRODUCTOS">
        <div className={styles.wrapper}>
          <SearchBar
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onSubmit={handleSearch}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={names}
            placeholder="Buscar por nombre"
          />
          <ProductTable products={visible} onEdit={openEdit} />
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
      {editingProduct && <ProductEditModal product={editingProduct} onClose={closeEdit} onSaved={handleSaved} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};