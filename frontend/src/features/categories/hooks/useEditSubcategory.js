import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { updateSubcategory } from '../services/categoryService';

export const useEditSubcategory = (subcategory, onSaved) => {
  const [name, setName] = useState(subcategory.nombre);
  const { preview, handleFileChange, file } = useFileWithPreview(subcategory.imagen_subcategoria);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));
  const handleSave = async (event) => {
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
      await updateSubcategory(subcategory.id_subcategoria, formData);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo modificar la subcategoría');
    } finally {
      setLoading(false);
    }
  };

  return { name, setName, preview, handleFileChange, error, loading, handleSave };
};