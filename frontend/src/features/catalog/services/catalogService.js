import { api } from '../../../lib/api';

export const getCategoryOptions = async () => {
  const { data } = await api.get('/categories/options');
  return data;
};

export const getSubcategoryOptions = async (categoryId) => {
  const { data } = await api.get(`/categories/${categoryId}/subcategory-options`);
  return data;
};

export const getProductsBySubcategory = async (idSubcategoria) => {
  const { data } = await api.get(`/products/by-subcategory/${idSubcategoria}`);
  return data;
};

export const getProductCatalogDetail = async (idProd) => {
  const { data } = await api.get(`/products/${idProd}/catalog-detail`);
  return data;
};

export const getActivePromotions = async () => {
  const { data } = await api.get('/promotions/catalog');
  return data;
};

export const getPromotionCatalogDetail = async (idProm) => {
  const { data } = await api.get(`/promotions/${idProm}/catalog-detail`);
  return data;
};