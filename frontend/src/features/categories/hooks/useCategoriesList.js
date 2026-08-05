import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getCategories, getCategoryNames } from '../services/categoryService';

export const useCategoriesList = () => {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [names, setNames] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [managingCategory, setManagingCategory] = useState(null);
  const [success, setSuccess] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  const fetchCategories = async (term) => {
    const data = await getCategories(term);
    setCategories(data);
  };
  useEffect(() => {
    fetchCategories('');
    getCategoryNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchCategories(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchCategories(name);
  };
  const openEdit = (category) => setEditingCategory(category);
  const closeEdit = () => setEditingCategory(null);
  const openManage = (category) => setManagingCategory(category);
  const closeManage = () => {
    setManagingCategory(null);
    fetchCategories(search.trim());
  };
  const handleSaved = () => {
    setSuccess('Se ha registrado con éxito la modificación');
    closeEdit();
    fetchCategories(search.trim());
    getCategoryNames().then(setNames).catch(() => {});
  };

  return {
    search,
    setSearch,
    categories,
    names,
    handleSearch,
    handleSelectSuggestion,
    editingCategory,
    openEdit,
    closeEdit,
    managingCategory,
    openManage,
    closeManage,
    success,
    handleSaved
  };
};