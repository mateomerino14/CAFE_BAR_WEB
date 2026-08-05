import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getAllPromotionsStatus, getAllPromotionNames, setPromotionAvailability } from '../services/promotionService';

export const usePromotionStatusList = () => {
  const [search, setSearch] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [names, setNames] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  useAutoDismiss(error, () => setError(''));
  const fetchPromotions = async (term) => {
    const data = await getAllPromotionsStatus(term);
    setPromotions(data);
  };
  useEffect(() => {
    fetchPromotions('');
    getAllPromotionNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchPromotions(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchPromotions(name);
  };
  const handleToggle = async (promotion) => {
    try {
      await setPromotionAvailability(promotion.id_prom, !promotion.activo);
      setSuccess(promotion.activo ? 'Promoción deshabilitada' : 'Promoción habilitada');
      fetchPromotions(search.trim());
    } catch (err) {
      setError('No se pudo actualizar el estado de la promoción');
    }
  };
  return { search, setSearch, promotions, names, handleSearch, handleSelectSuggestion, handleToggle, success, error };
};