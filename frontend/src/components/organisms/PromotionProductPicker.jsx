import {useEffect, useState} from 'react';
import {Button} from '../atoms/Button';
import {TextInput} from '../atoms/TextInput';
import {SearchableSelect} from '../molecules/SearchableSelect';
import {ProductCombobox} from '../molecules/ProductCombobox';
import {FormField} from '../molecules/FormField';
import {getCategoryOptions, getSubcategoryOptions} from '../../features/products/services/productService';
import {getProductsBySubcategory} from '../../features/promotions/services/promotionService';

const styles = {
  wrapper: 'flex flex-col gap-3',
  filters: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  pickRow: 'grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end'
};

export const PromotionProductPicker = ({productInput, onInputChange, onSelect, quantity, onQuantityChange, onAdd}) => {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [idSubcategoria, setIdSubcategoria] = useState('');
  const [productOptions, setProductOptions] = useState([]);

  useEffect(() => {
    getCategoryOptions().then(setCategoryOptions).catch(() => setCategoryOptions([]));
  }, []);

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
      setProductOptions([]);
      return;
    }
    getProductsBySubcategory(idSubcategoria).then(setProductOptions).catch(() => setProductOptions([]));
  }, [idSubcategoria]);

  return (
    <div className={styles.wrapper}>
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
      <div className={styles.pickRow}>
        <FormField label="PRODUCTO">
          <ProductCombobox
            value={productInput}
            onInputChange={onInputChange}
            options={productOptions}
            onSelect={onSelect}
            placeholder={idSubcategoria ? 'Buscar producto' : 'Primero seleccione una subcategoría'}
            disabled={!idSubcategoria}
          />
        </FormField>
        <FormField label="CANTIDAD">
          <TextInput value={quantity} onChange={(event) => onQuantityChange(event.target.value)} placeholder="0" maxLength={3} />
        </FormField>
        <Button type="button" onClick={onAdd}>AÑADIR</Button>
      </div>
    </div>
  );
};