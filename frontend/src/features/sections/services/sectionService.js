import { api } from '../../../lib/api';

export const createSection = async (payload) => {
  const { data } = await api.post('/sections', payload);
  return data;
};

export const getSections = async () => {
  const { data } = await api.get('/sections');
  return data;
};

export const getSectionTableCount = async (id) => {
  const { data } = await api.get(`/sections/${id}/tables-count`);
  return data.count;
};

export const updateSection = async (id, payload) => {
  const { data } = await api.put(`/sections/${id}`, payload);
  return data;
};