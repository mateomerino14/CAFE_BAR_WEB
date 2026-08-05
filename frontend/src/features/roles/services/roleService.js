import { api } from '../../../lib/api';

export const getScreensTree = async () => {
  const { data } = await api.get('/screens/tree');
  return data;
};

export const createRole = async (nombre, subpantallaIds) => {
  const { data } = await api.post('/roles', { nombre, subpantallaIds });
  return data;
};

export const getRoles = async (search) => {
  const { data } = await api.get('/roles', { params: { search } });
  return data;
};

export const getRolePermissions = async (idCargo) => {
  const { data } = await api.get(`/roles/${idCargo}/permissions`);
  return data.subpantallaIds;
};

export const updateRolePermissions = async (idCargo, subpantallaIds) => {
  const { data } = await api.put(`/roles/${idCargo}/permissions`, { subpantallaIds });
  return data;
};

export const getRoleNames = async () => {
  const { data } = await api.get('/roles/names');
  return data;
};