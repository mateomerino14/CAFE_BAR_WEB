import { api } from '../../../lib/api';

export const getReportEmployees = async () => {
  const { data } = await api.get('/reports/employees');
  return data;
};

export const getDetailedSalesReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { data } = await api.get('/reports/detallado', { params: { fechaInicio, fechaFin, empleadoId } });
  return data;
};

export const getSummaryByDateReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { data } = await api.get('/reports/resumen-fechas', { params: { fechaInicio, fechaFin, empleadoId } });
  return data;
};

export const getTopProductsReport = async (fechaInicio, fechaFin) => {
  const { data } = await api.get('/reports/productos-vendidos', { params: { fechaInicio, fechaFin } });
  return data;
};

export const getEmployeeChartReport = async (fechaInicio, fechaFin, tipo) => {
  const { data } = await api.get('/reports/resumen-empleado', { params: { fechaInicio, fechaFin, tipo } });
  return data;
};

export const getEmployeeSalesReport = async (fechaInicio, fechaFin, empleadoId) => {
  const { data } = await api.get('/reports/venta-empleado', { params: { fechaInicio, fechaFin, empleadoId } });
  return data;
};

export const sendReportEmail = async (correoDestino, titulo, htmlContent) => {
  const { data } = await api.post('/reports/send-email', { correoDestino, titulo, htmlContent });
  return data;
};