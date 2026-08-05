import { api } from '../../../lib/api';

export const getTaxLink = async () => {
  const { data } = await api.get('/config/tax-link');
  return data.enlace;
};

export const updateTaxLink = async (enlace) => {
  const { data } = await api.put('/config/tax-link', { enlace });
  return data;
};

export const changeDirectorioPassword = async (actual, nueva) => {
  const { data } = await api.put('/config/directorio-password', { actual, nueva });
  return data;
};


export const getDailySalesSummary = async () => {
  const { data } = await api.get('/config/daily-sales/summary');
  return data;
};

export const getDailySales = async (filtro, busqueda) => {
  const { data } = await api.get('/config/daily-sales', { params: { filtro, busqueda } });
  return data;
};

export const getDailySaleDetails = async (idVenta) => {
  const { data } = await api.get(`/config/daily-sales/${idVenta}/details`);
  return data;
};

export const getCajeroNames = async () => {
  const { data } = await api.get('/config/daily-sales/cajeros');
  return data;
};