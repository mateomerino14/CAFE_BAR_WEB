import { api } from '../../../lib/api';

export const loginRequest = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const getDirectorioAlias = async () => {
  const { data } = await api.get('/auth/directorio-alias');
  return data.alias;
};

export const getEmployeesForLogin = async () => {
  const { data } = await api.get('/employees/login-list');
  return data;
};