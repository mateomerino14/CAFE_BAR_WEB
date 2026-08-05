import { MainLayout } from '../../../components/templates/MainLayout';
import { Button } from '../../../components/atoms/Button';
import { InterestSelector } from '../../../components/organisms/InterestSelector';
import { SearchableSelect } from '../../../components/molecules/SearchableSelect';
import { FormField } from '../../../components/molecules/FormField';
import { CatalogGrid } from '../../../components/organisms/CatalogGrid';
import { Pagination } from '../../../components/molecules/Pagination';
import { ProductDetailModal } from '../../../components/organisms/ProductDetailModal';
import { PromotionDetailModal } from '../../../components/organisms/PromotionDetailModal';
import { Toast } from '../../../components/atoms/Toast';
import { useFamilyBrowser } from '../hooks/useFamilyBrowser';
import { usePagination } from '../../../hooks/usePagination';

const PAGE_SIZE = 12;

const styles = {
  wrapper: 'flex flex-col gap-4',
  card: 'flex flex-col gap-4 rounded-xl bg-white p-6 shadow-sm',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  loading: 'rounded-xl bg-white p-6 text-center text-sm font-semibold text-blue-500 shadow-sm'
};

export const FamilyPage = () => {
  const {
    interest, handleSelectInterest,
    categoryOptions, subcategoryOptions, idCategoria, setIdCategoria, idSubcategoria, setIdSubcategoria,
    results, resultType, loading, error, handleGenerate,
    selectedItem, selectItem, closeDetail
  } = useFamilyBrowser();

  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(results, PAGE_SIZE);

  return (
    <>
      <MainLayout title="FAMILIA">
        <div className={styles.wrapper}>
          <form onSubmit={handleGenerate} className={styles.card}>
            <InterestSelector value={interest} onChange={handleSelectInterest} />
            {interest === 'products' && (
              <div className={styles.grid}>
                <FormField label="CATEGORÍA">
                  <SearchableSelect
                    options={categoryOptions.map((option) => ({ value: option.id_categoria, label: option.nombre_categoria }))}
                    placeholder="Buscar categoría"
                    value={idCategoria}
                    onChange={setIdCategoria}
                  />
                </FormField>
                <FormField label="SUBCATEGORÍA">
                  <SearchableSelect
                    options={subcategoryOptions.map((option) => ({ value: option.id_subcategoria, label: option.nombre }))}
                    placeholder={idCategoria ? 'Buscar subcategoría' : 'Primero seleccione una categoría'}
                    value={idSubcategoria}
                    onChange={setIdSubcategoria}
                    disabled={!idCategoria}
                  />
                </FormField>
              </div>
            )}
            <Button type="submit" disabled={loading}>{loading ? 'BUSCANDO...' : 'GENERAR'}</Button>
          </form>

          {loading && <p className={styles.loading}>Buscando...</p>}

          {!loading && results.length > 0 && (
            <>
              <CatalogGrid items={visible} type={resultType} onSelect={selectItem} />
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
      {selectedItem && resultType === 'products' && <ProductDetailModal product={selectedItem} onClose={closeDetail} />}
      {selectedItem && resultType === 'promotions' && <PromotionDetailModal promotion={selectedItem} onClose={closeDetail} />}
      {error && <Toast>{error}</Toast>}
    </>
  );
};