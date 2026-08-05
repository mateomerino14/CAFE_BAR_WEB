import { api } from '../../../lib/api';

export const getDeletionData = async (filtroEmpleados) => {
  const { data } = await api.get('/deletion/deletion-data', { params: { filtroEmpleados } });
  return data;
};

export const getDependencyTree = async (seleccionados) => {
  const { data } = await api.post('/deletion/deletion-tree', seleccionados);
  return data;
};

export const executeDeletion = async (seleccionados) => {
  const { data } = await api.post('/deletion/execute', seleccionados);
  return data;
};