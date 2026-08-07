import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getSubcategories, setSubcategoryAvailability } from '../services/categoryService';

export const useManageSubcategories = (categoryId) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  useAutoDismiss(success, () => setSuccess(''));
  useAutoDismiss(error, () => setError(''));

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const data = await getSubcategories(categoryId);
      setSubcategories(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSubcategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);
  const handleToggle = async (subcategory) => {
    try {
      await setSubcategoryAvailability(subcategory.id_subcategoria, !subcategory.activa);
      setSuccess(subcategory.activa ? 'Subcategoría desactivada correctamente' : 'Subcategoría activada correctamente');
      fetchSubcategories();
    } catch (err) {
      setError('No se pudo cambiar el estado de la subcategoría');
    }
  };

  const openEdit = (subcategory) => setEditingSubcategory(subcategory);
  const closeEdit = () => setEditingSubcategory(null);

  const handleAdded = () => {
    setSuccess('Subcategoría agregada correctamente');
    fetchSubcategories();
  };

  const handleEdited = () => {
    setSuccess('Subcategoría actualizada correctamente');
    closeEdit();
    fetchSubcategories();
  };

  return { subcategories, loading, handleToggle, editingSubcategory, openEdit, closeEdit, handleAdded, handleEdited, success, error };
};