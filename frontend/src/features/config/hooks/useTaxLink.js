import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getTaxLink, updateTaxLink } from '../services/configService';

export const useTaxLink = (onSaved) => {
  const [enlace, setEnlace] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useAutoDismiss(error, () => setError(''));

  useEffect(() => {
    getTaxLink().then(setEnlace).catch(() => {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!enlace.trim().startsWith('http')) {
      setError('La URL debe comenzar con http:// o https://');
      return;
    }

    setLoading(true);
    try {
      await updateTaxLink(enlace.trim());
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo actualizar el enlace');
    } finally {
      setLoading(false);
    }
  };

  return { enlace, setEnlace, error, loading, handleSubmit };
};