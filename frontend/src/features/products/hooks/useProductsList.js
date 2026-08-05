import { useEffect, useState } from 'react';
import { getProducts, getProductNames } from '../services/productService';

export const useProductsList = () => {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [names, setNames] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const fetchProducts = async (term) => {
    const data = await getProducts(term);
    setProducts(data);
  };
  useEffect(() => {
    fetchProducts('');
    getProductNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchProducts(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchProducts(name);
  };
  const openEdit = (product) => setEditingProduct(product);
  const closeEdit = () => setEditingProduct(null);
  const refresh = () => {
    fetchProducts(search.trim());
    getProductNames().then(setNames).catch(() => {});
  };
  return { search, setSearch, products, names, handleSearch, handleSelectSuggestion, editingProduct, openEdit, closeEdit, refresh };
};