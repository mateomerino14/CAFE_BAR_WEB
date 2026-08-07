import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { createCategory } from '../services/categoryService';

let nextId = 1;

export const useRegisterCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const { file: categoryPhoto, preview: categoryPreview, handleFileChange: handleCategoryPhotoChange, reset: resetCategoryPhoto } = useFileWithPreview();
  const [subcategoryName, setSubcategoryName] = useState('');
  const { file: subcategoryPhoto, preview: subcategoryPreview, handleFileChange: handleSubcategoryPhotoChange, reset: resetSubcategoryPhoto } = useFileWithPreview();
  const [subcategories, setSubcategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  const isEditing = editingId !== null;

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setSubcategoryName(item.nombre);
    resetSubcategoryPhoto();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSubcategoryName('');
    resetSubcategoryPhoto();
  };

  const handleAddSubcategory = (event) => {
    event.preventDefault();
    setError('');
    const name = subcategoryName.trim();
    if (!name) {
      setError('El campo de subcategoría no puede estar vacío');
      return;
    }
    const alreadyExists = subcategories.some(
      (item) => item.nombre.toLowerCase() === name.toLowerCase() && item.id !== editingId
    );
    if (alreadyExists) {
      setError('La subcategoría ya está registrada');
      return;
    }

    if (isEditing) {
      setSubcategories((prev) => prev.map((item) => {
        if (item.id !== editingId) return item;
        return {
          ...item,
          nombre: name,
          photo: subcategoryPhoto || item.photo,
          preview: subcategoryPreview || item.preview
        };
      }));
      setEditingId(null);
    } else {
      setSubcategories((prev) => [...prev, { id: nextId++, nombre: name, photo: subcategoryPhoto, preview: subcategoryPreview }]);
    }

    setSubcategoryName('');
    resetSubcategoryPhoto();
  };

  const handleRemoveSubcategory = (id) => {
    setSubcategories((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) handleCancelEdit();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!categoryName.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }
    if (subcategories.length === 0) {
      setError('La categoría debe tener por lo menos una subcategoría');
      return;
    }
    const formData = new FormData();
    formData.append('nombreCategoria', categoryName.trim());
    if (categoryPhoto) formData.append('categoryPhoto', categoryPhoto);
    const subcategoriesMeta = subcategories.map((item) => ({ nombre: item.nombre }));
    formData.append('subcategoriesMeta', JSON.stringify(subcategoriesMeta));
    subcategories.forEach((item, index) => {
      if (item.photo) formData.append(`subcategoryPhoto_${index}`, item.photo);
    });
    setLoading(true);
    try {
      await createCategory(formData);
      setSuccess('¡Se ha registrado con éxito!');
      setCategoryName('');
      resetCategoryPhoto();
      setSubcategories([]);
      handleCancelEdit();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return {
    categoryName,
    setCategoryName,
    categoryPreview,
    handleCategoryPhotoChange,
    subcategoryName,
    setSubcategoryName,
    subcategoryPreview,
    handleSubcategoryPhotoChange,
    subcategories,
    editingId,
    isEditing,
    handleAddSubcategory,
    handleRemoveSubcategory,
    handleStartEdit,
    handleCancelEdit,
    error,
    success,
    loading,
    handleSubmit
  };
};