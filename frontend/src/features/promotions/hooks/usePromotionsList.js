import { useEffect, useState } from 'react';
import { getPromotions, getPromotionNames } from '../services/promotionService';

export const usePromotionsList = () => {
  const [search, setSearch] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [names, setNames] = useState([]);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const fetchPromotions = async (term) => {
    const data = await getPromotions(term);
    setPromotions(data);
  };
  useEffect(() => {
    fetchPromotions('');
    getPromotionNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchPromotions(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchPromotions(name);
  };
  const openEdit = (promotion) => setEditingPromotion(promotion);
  const closeEdit = () => setEditingPromotion(null);
  const refresh = () => {
    fetchPromotions(search.trim());
    getPromotionNames().then(setNames).catch(() => {});
  };

  return { search, setSearch, promotions, names, handleSearch, handleSelectSuggestion, editingPromotion, openEdit, closeEdit, refresh };
};