import {useEffect, useState} from 'react';
import {InterestSelector} from './InterestSelector';
import {SearchableSelect} from '../molecules/SearchableSelect';
import {FormField} from '../molecules/FormField';
import {ImageBox} from '../atoms/ImageBox';
import {Button} from '../atoms/Button';
import {Pagination} from '../molecules/Pagination';
import {usePagination} from '../../hooks/usePagination';
import {getCategoryOptions, getSubcategoryOptions} from '../../features/products/services/productService';
import {getProductsBySubcategory} from '../../features/promotions/services/promotionService';
import {getPromotionsForPos} from '../../features/pos/services/posService';

const PAGE_SIZE = 12;

const styles = {
  wrapper: 'flex flex-col gap-4',
  filters: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  grid: 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4',
  card: 'flex flex-col items-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm',
  name: 'text-sm font-bold text-slate-800',
  price: 'text-xs font-semibold text-emerald-600',
  loading: 'rounded-xl bg-white p-6 text-center text-sm font-semibold text-blue-500 shadow-sm',
  empty: 'rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm',
  hint: 'rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm'
};

export const PosProductBrowser = ({onAddProduct, onAddPromotion}) => {
  const [interest, setInterest] = useState('products');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [idSubcategoria, setIdSubcategoria] = useState('');
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const items = interest === 'products' ? products : promotions;
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(items, PAGE_SIZE);
  useEffect(() => {
    getCategoryOptions().then(setCategoryOptions).catch(() => setCategoryOptions([]));
  }, []);
  useEffect(() => {
    if (interest !== 'promotions') return;
    setLoading(true);
    setHasSearched(true);
    getPromotionsForPos()
      .then(setPromotions)
      .catch(() => setPromotions([]))
      .finally(() => setLoading(false));
  }, [interest]);
  useEffect(() => {
    if (interest === 'products' && !idSubcategoria) {
      setHasSearched(false);
    }
  }, [interest]);
  useEffect(() => {
    if (!idCategoria) {
      setSubcategoryOptions([]);
      setIdSubcategoria('');
      return;
    }
    getSubcategoryOptions(idCategoria).then(setSubcategoryOptions).catch(() => setSubcategoryOptions([]));
  }, [idCategoria]);
  useEffect(() => {
    if (!idSubcategoria) {
      setProducts([]);
      setHasSearched(false);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    getProductsBySubcategory(idSubcategoria)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [idSubcategoria]);
  return (
    <div className={styles.wrapper}>
      <InterestSelector value={interest} onChange={setInterest} />
      {interest === 'products' && (
        <div className={styles.filters}>
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
      {loading && <p className={styles.loading}>Cargando...</p>}
      {!loading && interest === 'products' && !idSubcategoria && (
        <p className={styles.hint}>Selecciona una categoría y subcategoría para ver los productos</p>
      )}
      {!loading && hasSearched && items.length === 0 && (
        <p className={styles.empty}>
          {interest === 'products' ? 'No hay productos en esta subcategoría' : 'No hay promociones activas en este momento'}
        </p>
      )}
      {!loading && items.length > 0 && (
        <>
          <div className={styles.grid}>
            {visible.map((item) =>
              interest === 'products' ? (
                <div key={item.id_prod} className={styles.card}>
                  <span className={styles.name}>{item.nom_prod}</span>
                  <ImageBox src={item.img_prod} alt={item.nom_prod} className="h-20 w-20" />
                  <span className={styles.price}>Bs {Number(item.precio_venta).toFixed(2)}</span>
                  <Button type="button" size="sm" onClick={() => onAddProduct(item)}>AGREGAR</Button>
                </div>
              ) : (
                <div key={item.id_prom} className={styles.card}>
                  <span className={styles.name}>{item.nom_prom}</span>
                  <ImageBox src={item.img_prom} alt={item.nom_prom} className="h-20 w-20" />
                  <span className={styles.price}>Bs {Number(item.precio_prom).toFixed(2)}</span>
                  <Button type="button" size="sm" onClick={() => onAddPromotion(item)}>AGREGAR</Button>
                </div>
              )
            )}
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
  );
};