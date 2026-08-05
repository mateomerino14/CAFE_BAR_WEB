import { useState } from 'react';
import { MainLayout } from '../../../components/templates/MainLayout';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { PromotionTable } from '../../../components/organisms/PromotionTable';
import { PromotionEditModal } from '../../../components/organisms/PromotionEditModal';
import { Toast } from '../../../components/atoms/Toast';
import { usePromotionsList } from '../hooks/usePromotionsList';
import { usePagination } from '../../../hooks/usePagination';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';

const PAGE_SIZE = 4;
const styles = { wrapper: 'flex flex-col gap-4' };

export const ManagePromotionsPage = () => {
  const { search, setSearch, promotions, names, handleSearch, handleSelectSuggestion, editingPromotion, openEdit, closeEdit, refresh } = usePromotionsList();
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(promotions, PAGE_SIZE);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));

  const handleSaved = () => {
    setSuccess('Se ha registrado con éxito la modificación');
    closeEdit();
    refresh();
  };

  return (
    <>
      <MainLayout title="MODIFICAR PROMOCIONES">
        <div className={styles.wrapper}>
          <SearchBar value={search} onChange={(event) => setSearch(event.target.value)} onSubmit={handleSearch} onSelectSuggestion={handleSelectSuggestion} suggestions={names} placeholder="Buscar por nombre" />
          <PromotionTable promotions={visible} onEdit={openEdit} />
          <Pagination currentPage={currentPage} totalPages={totalPages} canGoLeft={canGoLeft} canGoRight={canGoRight} onPrev={goLeft} onNext={goRight} />
        </div>
      </MainLayout>
      {editingPromotion && <PromotionEditModal promotion={editingPromotion} onClose={closeEdit} onSaved={handleSaved} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};