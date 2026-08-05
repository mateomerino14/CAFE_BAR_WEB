import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getAllProductsStatus, getAllProductNames, setProductAvailability } from '../services/productService';

export const useProductStatusList = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [names, setNames] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  useAutoDismiss(error, () => setError(''));
  const fetchProducts = async (term) => {
    const data = await getAllProductsStatus(term);
    setProducts(data);
  };
  useEffect(() => {
    fetchProducts('');
    getAllProductNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchProducts(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchProducts(name);
  };
  const handleToggle = async (product) => {
    try {
      await setProductAvailability(product.id_prod, !product.activo);
      setSuccess(product.activo ? 'Producto deshabilitado' : 'Producto habilitado');
      fetchProducts(search.trim());
    } catch (err) {
      setError('No se pudo actualizar el estado del producto');
    }
  };
  return { search, setSearch, products, names, handleSearch, handleSelectSuggestion, handleToggle, success, error };
};