import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { addSubcategory } from '../services/categoryService';

export const useAddSubcategory = (categoryId, onAdded) => {
  const [name, setName] = useState('');
  const { preview, handleFileChange, file, reset } = useFileWithPreview();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('El nombre de la subcategoría no puede estar vacío');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', name.trim());
    if (file) formData.append('subcategoryPhoto', file);
    setLoading(true);
    try {
      await addSubcategory(categoryId, formData);
      setName('');
      reset();
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo agregar la subcategoría');
    } finally {
      setLoading(false);
    }
  };

  return { name, setName, preview, handleFileChange, error, loading, handleSubmit };
};