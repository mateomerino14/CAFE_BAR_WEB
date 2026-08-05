import { MainLayout } from '../../../components/templates/MainLayout';
import { SectionCard } from '../../../components/organisms/SectionCard';
import { AddSectionCard } from '../../../components/organisms/AddSectionCard';
import { RegisterSectionModal } from '../../../components/organisms/RegisterSectionModal';
import { ManageSectionModal } from '../../../components/organisms/ManageSectionModal';
import { Pagination } from '../../../components/molecules/Pagination';
import { Toast } from '../../../components/atoms/Toast';
import { useSections } from '../hooks/useSections';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 11;

const styles = {
  wrapper: 'flex flex-col gap-4',
  grid: 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
  loading: 'rounded-xl bg-white p-6 text-center text-sm font-semibold text-blue-500 shadow-sm'
};

export const SectionsPage = () => {
  const {
    sections,
    loading,
    managingSection,
    openManage,
    closeManage,
    isRegisterOpen,
    openRegister,
    closeRegister,
    handleRegistered,
    handleUpdated,
    success
  } = useSections();

  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(sections, PAGE_SIZE);

  return (
    <>
      <MainLayout title="SECCIONES">
        <div className={styles.wrapper}>
          {loading ? (
            <p className={styles.loading}>Cargando secciones...</p>
          ) : (
            <>
              <div className={styles.grid}>
                <AddSectionCard onClick={openRegister} />
                {visible.map((section) => (
                  <SectionCard key={section.id_seccion} section={section} onClick={() => openManage(section)} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                canGoLeft={canGoLeft}
                canGoRight={canGoRight}
                onPrev={goLeft}
                onNext={goRight}
              />
            </>
          )}
        </div>
      </MainLayout>
      {isRegisterOpen && <RegisterSectionModal onClose={closeRegister} onRegistered={handleRegistered} />}
      {managingSection && <ManageSectionModal section={managingSection} onClose={closeManage} onUpdated={handleUpdated} />}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};