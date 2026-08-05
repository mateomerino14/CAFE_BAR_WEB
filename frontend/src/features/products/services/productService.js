import { api } from '../../../lib/api';

export const createProduct = async (formData) => {
  const { data } = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const getProductNames = async () => {
  const { data } = await api.get('/products/names');
  return data;
};

export const getAllProductNames = async () => {
  const { data } = await api.get('/products/names/all');
  return data;
};

export const getProducts = async (search) => {
  const { data } = await api.get('/products', { params: { search } });
  return data;
};

export const getAllProductsStatus = async (search) => {
  const { data } = await api.get('/products/status', { params: { search } });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const updateProduct = async (id, formData) => {
  const { data } = await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const setProductAvailability = async (id, available) => {
  const { data } = await api.put(`/products/${id}/availability`, { available });
  return data;
};

export const getCategoryOptions = async () => {
  const { data } = await api.get('/categories/options');
  return data;
};

export const getSubcategoryOptions = async (categoryId) => {
  const { data } = await api.get(`/categories/${categoryId}/subcategory-options`);
  return data;
};

export const getStockOptions = async () => {
  const { data } = await api.get('/stock/options');
  return data;
};

export const getProductIngredients = async (id) => {
  const { data } = await api.get(`/products/${id}/ingredients`);
  return data;
};