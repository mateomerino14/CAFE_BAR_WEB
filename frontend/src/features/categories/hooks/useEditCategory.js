import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { updateCategory } from '../services/categoryService';

export const useEditCategory = (category, onSaved) => {
  const [name, setName] = useState(category.nombre_categoria);
  const { preview, handleFileChange, file } = useFileWithPreview(category.imagen_categoria);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('El nombre de la categoría no puede estar vacío');
      return;
    }
    const formData = new FormData();
    formData.append('nombreCategoria', name.trim());
    if (file) formData.append('categoryPhoto', file);
    setLoading(true);
    try {
      await updateCategory(category.id_categoria, formData);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo modificar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return { name, setName, preview, handleFileChange, error, loading, handleSave };
};