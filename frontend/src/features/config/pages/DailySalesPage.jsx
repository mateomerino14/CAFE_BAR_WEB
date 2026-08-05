import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { SearchBar } from '../../../components/molecules/SearchBar';
import { Pagination } from '../../../components/molecules/Pagination';
import { DailySalesSummaryCards } from '../../../components/organisms/DailySalesSummaryCards';
import { DailySalesTable } from '../../../components/organisms/DailySalesTable';
import { SaleDetailsModal } from '../../../components/organisms/SaleDetailsModal';
import { useDailySales } from '../hooks/useDailySales';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 5;

const styles = {
  wrapper: 'flex flex-col gap-4',
  filtersRow: 'flex flex-col gap-3 sm:flex-row sm:items-center',
  searchWrapper: 'sm:flex-1',
  filterButtons: 'flex flex-wrap gap-2',
  filterButton: 'shrink-0 rounded-full px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105',
  active: 'ring-2 ring-offset-2 ring-slate-800',
  todas: 'bg-slate-700',
  finalizadas: 'bg-emerald-500',
  preparacion: 'bg-orange-400',
  reloadRow: 'flex justify-end'
};

export const DailySalesPage = () => {
  const {
    summary, sales, cajeroNames, loading,
    filtro, handleFilter,
    busqueda, setBusqueda, handleSearch, handleSelectSuggestion,
    handleReload,
    selectedVenta, setSelectedVenta
  } = useDailySales();

  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(sales, PAGE_SIZE);

  return (
    <>
      <MainLayout title="VENTAS DIARIAS">
        <div className={styles.wrapper}>
          <DailySalesSummaryCards summary={summary} />

          <div className={styles.filtersRow}>
            <div className={styles.searchWrapper}>
              <SearchBar
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                onSubmit={handleSearch}
                onSelectSuggestion={handleSelectSuggestion}
                suggestions={cajeroNames}
                placeholder="Buscar por cajero"
              />
            </div>
            <div className={styles.filterButtons}>
              <button type="button" className={`${styles.filterButton} ${styles.todas} ${filtro === null ? styles.active : ''}`} onClick={() => handleFilter(null)}>TODAS</button>
              <button type="button" className={`${styles.filterButton} ${styles.finalizadas} ${filtro === 'Finalizadas' ? styles.active : ''}`} onClick={() => handleFilter('Finalizadas')}>FINALIZADAS</button>
              <button type="button" className={`${styles.filterButton} ${styles.preparacion} ${filtro === 'En preparación' ? styles.active : ''}`} onClick={() => handleFilter('En preparación')}>EN PREPARACIÓN</button>
            </div>
          </div>

          <div className={styles.reloadRow}>
            <Button type="button" variant="warning" onClick={handleReload}>RECARGAR</Button>
          </div>

          {loading ? (
            <p className="text-center text-sm text-blue-500">Cargando...</p>
          ) : (
            <>
              <DailySalesTable sales={visible} onSelect={setSelectedVenta} />
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
      {selectedVenta && <SaleDetailsModal venta={selectedVenta} onClose={() => setSelectedVenta(null)} />}
    </>
  );
};