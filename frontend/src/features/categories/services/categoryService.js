import { api } from '../../../lib/api';

export const createCategory = async (formData) => {
  const { data } = await api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const getCategoryNames = async () => {
  const { data } = await api.get('/categories/names');
  return data;
};

export const getAllCategoryNames = async () => {
  const { data } = await api.get('/categories/names/all');
  return data;
};

export const getCategories = async (search) => {
  const { data } = await api.get('/categories', { params: { search } });
  return data;
};

export const getAllCategoriesStatus = async (search) => {
  const { data } = await api.get('/categories/status', { params: { search } });
  return data;
};

export const updateCategory = async (id, formData) => {
  const { data } = await api.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const setCategoryAvailability = async (id, available) => {
  const { data } = await api.put(`/categories/${id}/availability`, { available });
  return data;
};

export const getSubcategories = async (categoryId) => {
  const { data } = await api.get(`/categories/${categoryId}/subcategories`);
  return data;
};

export const addSubcategory = async (categoryId, formData) => {
  const { data } = await api.post(`/categories/${categoryId}/subcategories`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const updateSubcategory = async (subcategoryId, formData) => {
  const { data } = await api.put(`/subcategories/${subcategoryId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const setSubcategoryAvailability = async (subcategoryId, available) => {
  const { data } = await api.put(`/subcategories/${subcategoryId}/availability`, { available });
  return data;
};