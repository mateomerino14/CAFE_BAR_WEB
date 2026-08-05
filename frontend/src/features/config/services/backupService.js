import { api } from '../../../lib/api';

export const downloadBackup = async () => {
  const response = await api.get('/backup/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'backup_cafebar.xlsx');
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const importBackup = async (file, confirmacion) => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('confirmacion', confirmacion);
  const { data } = await api.post('/backup/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const sendBackupEmail = async (correoDestino) => {
  const { data } = await api.post('/backup/send-email', { correoDestino });
  return data;
};