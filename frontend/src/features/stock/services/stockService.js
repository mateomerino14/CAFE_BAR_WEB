import { api } from '../../../lib/api';

export const createStockItem = async (payload) => {
  const { data } = await api.post('/stock', payload);
  return data;
};

export const getStockNames = async () => {
  const { data } = await api.get('/stock/names');
  return data;
};

export const getStockList = async (search) => {
  const { data } = await api.get('/stock', { params: { search } });
  return data;
};

export const getStockItem = async (id) => {
  const { data } = await api.get(`/stock/${id}`);
  return data;
};

export const updateStockItem = async (id, payload) => {
  const { data } = await api.put(`/stock/${id}`, payload);
  return data;
};