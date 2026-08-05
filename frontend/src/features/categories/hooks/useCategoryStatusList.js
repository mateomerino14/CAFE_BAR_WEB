import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getAllCategoriesStatus, getAllCategoryNames, setCategoryAvailability } from '../services/categoryService';

export const useCategoryStatusList = () => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [names, setNames] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  useAutoDismiss(error, () => setError(''));
  const fetchCategories = async (term) => {
    const data = await getAllCategoriesStatus(term);
    setCategories(data);
  };
  useEffect(() => {
    fetchCategories('');
    getAllCategoryNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchCategories(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchCategories(name);
  };
  const handleToggle = async (category) => {
    try {
      await setCategoryAvailability(category.id_categoria, !category.activa);
      setSuccess(category.activa ? 'Categoría deshabilitada' : 'Categoría habilitada');
      fetchCategories(search.trim());
    } catch (err) {
      setError('No se pudo actualizar el estado de la categoría');
    }
  };

  return { search, setSearch, categories, names, handleSearch, handleSelectSuggestion, handleToggle, success, error };
};