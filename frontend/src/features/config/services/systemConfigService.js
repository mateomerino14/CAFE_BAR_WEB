import { api } from '../../../lib/api';

export const getSystemConfig = async () => {
  const { data } = await api.get('/system-config');
  return data;
};

export const updateSystemConfig = async (brevoApiKey, brevoSenderEmail, brevoSenderName) => {
  const { data } = await api.put('/system-config', { brevoApiKey, brevoSenderEmail, brevoSenderName });
  return data;
};
