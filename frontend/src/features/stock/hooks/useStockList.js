import { useEffect, useState } from 'react';
import { getStockList, getStockNames } from '../services/stockService';

export const useStockList = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [names, setNames] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const fetchItems = async (term) => {
    const data = await getStockList(term);
    setItems(data);
  };
  useEffect(() => {
    fetchItems('');
    getStockNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchItems(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchItems(name);
  };
  const openEdit = (item) => setEditingItem(item);
  const closeEdit = () => setEditingItem(null);
  const refresh = () => {
    fetchItems(search.trim());
    getStockNames().then(setNames).catch(() => {});
  };
  return { search, setSearch, items, names, handleSearch, handleSelectSuggestion, editingItem, openEdit, closeEdit, refresh };
};