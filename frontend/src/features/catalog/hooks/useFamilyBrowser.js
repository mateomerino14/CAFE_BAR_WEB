import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getCategoryOptions, getSubcategoryOptions, getProductsBySubcategory, getActivePromotions } from '../services/catalogService';

export const useFamilyBrowser = () => {
  const [interest, setInterest] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [idCategoria, setIdCategoria] = useState('');
  const [idSubcategoria, setIdSubcategoria] = useState('');
  const [results, setResults] = useState([]);
  const [resultType, setResultType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  useAutoDismiss(error, () => setError(''));
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

  const handleSelectInterest = (value) => {
    setInterest(value);
    setResults([]);
    setResultType(null);
    setSelectedItem(null);
    setIdCategoria('');
    setIdSubcategoria('');
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError('');
    setSelectedItem(null);
    if (!interest) {
      setError('Se debe seleccionar el área de interés');
      return;
    }
    setLoading(true);
    try {
      if (interest === 'promotions') {
        const data = await getActivePromotions();
        if (data.length === 0) {
          setError('No se encontraron promociones activas');
          setResults([]);
          return;
        }
        setResults(data);
        setResultType('promotions');
        return;
      }
      if (!idCategoria || !idSubcategoria) {
        setError('Debe seleccionar una categoría y subcategoría de producto');
        return;
      }
      const data = await getProductsBySubcategory(idSubcategoria);
      if (data.length === 0) {
        setError('No se encontraron productos con los criterios seleccionados');
        setResults([]);
        return;
      }
      setResults(data);
      setResultType('products');
    } finally {
      setLoading(false);
    }
  };
  const selectItem = (item) => setSelectedItem(item);
  const closeDetail = () => setSelectedItem(null);
  return {
    interest, handleSelectInterest,
    categoryOptions, subcategoryOptions, idCategoria, setIdCategoria, idSubcategoria, setIdSubcategoria,
    results, resultType, loading, error, handleGenerate,
    selectedItem, selectItem, closeDetail
  };
};