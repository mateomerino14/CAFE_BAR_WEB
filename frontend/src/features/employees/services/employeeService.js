import { api } from '../../../lib/api';

export const createEmployee = async (formData) => {
  const { data } = await api.post('/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const getEmployees = async (search) => {
  const { data } = await api.get('/employees', { params: { search } });
  return data;
};

export const getAllEmployeesStatus = async (search) => {
  const { data } = await api.get('/employees/status', { params: { search } });
  return data;
};

export const getEmployeeNames = async () => {
  const { data } = await api.get('/employees/names');
  return data;
};

export const updateEmployee = async (id, formData) => {
  const { data } = await api.put(`/employees/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const resetEmployeePassword = async (id, newPassword) => {
  const { data } = await api.put(`/employees/${id}/password`, { newPassword });
  return data;
};

export const setEmployeeAvailability = async (id, available) => {
  const { data } = await api.put(`/employees/${id}/availability`, { available });
  return data;
};

export const getCargoOptions = async () => {
  const { data } = await api.get('/roles/options');
  return data;
};

export const getAllEmployeeNames = async () => {
  const { data } = await api.get('/employees/names/all');
  return data;
};