import { api } from '../../../lib/api';

export const createPromotion = async (formData) => {
  const { data } = await api.post('/promotions', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const getPromotionNames = async () => {
  const { data } = await api.get('/promotions/names');
  return data;
};

export const getAllPromotionNames = async () => {
  const { data } = await api.get('/promotions/names/all');
  return data;
};

export const getPromotions = async (search) => {
  const { data } = await api.get('/promotions', { params: { search } });
  return data;
};

export const getAllPromotionsStatus = async (search) => {
  const { data } = await api.get('/promotions/status', { params: { search } });
  return data;
};

export const getPromotion = async (id) => {
  const { data } = await api.get(`/promotions/${id}`);
  return data;
};

export const updatePromotion = async (id, formData) => {
  const { data } = await api.put(`/promotions/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const setPromotionAvailability = async (id, available) => {
  const { data } = await api.put(`/promotions/${id}/availability`, { available });
  return data;
};

export const getProductsBySubcategory = async (idSubcategoria) => {
  const { data } = await api.get(`/products/by-subcategory/${idSubcategoria}`);
  return data;
};