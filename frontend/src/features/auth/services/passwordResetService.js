import { api } from '../../../lib/api';

export const requestPasswordResetCode = async (email) => {
  await api.post('/password-reset/request', { email });
};

export const verifyPasswordResetCode = async (email, code) => {
  await api.post('/password-reset/verify', { email, code });
};

export const submitNewPassword = async (email, code, newPassword) => {
  await api.post('/password-reset/reset', { email, code, newPassword });
};