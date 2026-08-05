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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  const handleAddSubcategory = (event) => {
    event.preventDefault();
    setError('');
    const name = subcategoryName.trim();
    if (!name) {
      setError('El campo de subcategoría no puede estar vacío');
      return;
    }
    const alreadyExists = subcategories.some((item) => item.nombre.toLowerCase() === name.toLowerCase());
    if (alreadyExists) {
      setError('La subcategoría ya está registrada');
      return;
    }
    setSubcategories((prev) => [...prev, { id: nextId++, nombre: name, photo: subcategoryPhoto, preview: subcategoryPreview }]);
    setSubcategoryName('');
    resetSubcategoryPhoto();
  };

  const handleRemoveSubcategory = (id) => {
    setSubcategories((prev) => prev.filter((item) => item.id !== id));
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
    handleAddSubcategory,
    handleRemoveSubcategory,
    error,
    success,
    loading,
    handleSubmit
  };
};