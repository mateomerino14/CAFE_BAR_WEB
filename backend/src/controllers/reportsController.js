import {
  listEmployeesForReports, getDetailedSalesReport, getSummaryByDateReport,getTopProductsReport, getEmployeeChartReport, getEmployeeSalesReport
} from '../services/reportsService.js';
import { sendReportPdfEmail } from '../services/emailService.js';

/* Controlador para listar los empleados disponibles para reportes */
export const listReportEmployeesHandler = async (req, res) => {
  try {
    const empleados = await listEmployeesForReports();
    return res.json(empleados);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener empleados'});
  }
};

/* Controlador para generar el reporte detallado de ventas */
export const getDetailedSalesReportHandler = async (req, res) => {
  const { fechaInicio, fechaFin, empleadoId } = req.query;
  if (!fechaInicio || !fechaFin) return res.status(400).json({message: 'Seleccione un rango de fechas'});
  try {
    const rows = await getDetailedSalesReport(fechaInicio, fechaFin, empleadoId);
    return res.json(rows);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al generar el reporte'});
  }
};

/* Controlador para generar el resumen de ventas por rango de fechas */
export const getSummaryByDateReportHandler = async (req, res) => {
  const { fechaInicio, fechaFin, empleadoId } = req.query;
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({message: 'Seleccione un rango de fechas'});
  }
  try {
    const result = await getSummaryByDateReport(fechaInicio, fechaFin, empleadoId);
    return res.json(result);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al generar el reporte'});
  }
};

/* Controlador para obtener los productos más vendidos en un periodo */
export const getTopProductsReportHandler = async (req, res) => {
  const { fechaInicio, fechaFin } = req.query;
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({message: 'Seleccione un rango de fechas'});
  }
  try{
    const rows = await getTopProductsReport(fechaInicio, fechaFin);
    return res.json(rows);
  } 
  catch (error){
    console.error(error);
    return res.status(500).json({message: 'Error al generar el reporte'});
  }
};

/* Controlador para generar el reporte gráfico de ventas por empleado */
export const getEmployeeChartReportHandler = async (req, res) => {
  const { fechaInicio, fechaFin, tipo } = req.query;
  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({message: 'Seleccione un rango de fechas'});
  }
  try {
    const rows = await getEmployeeChartReport(fechaInicio, fechaFin, tipo === 'mesero' ? 'mesero' : 'cajero');
    return res.json(rows);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al generar el reporte'});
  }
};

/* Controlador para generar el reporte de ventas de un empleado */
export const getEmployeeSalesReportHandler = async (req, res) => {
  const {fechaInicio, fechaFin, empleadoId} = req.query;
  if (!fechaInicio || !fechaFin || empleadoId === undefined) {
    return res.status(400).json({message: 'Faltan parámetros'});
  }
  try {
    const rows = await getEmployeeSalesReport(fechaInicio, fechaFin, empleadoId);
    return res.json(rows);
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'Error al generar el reporte'});
  }
};

/* Controlador para enviar un reporte por correo electrónico */
export const sendReportEmailHandler = async (req, res) => {
  const { correoDestino, titulo, htmlContent } = req.body;
  if (!correoDestino || !htmlContent) {
    return res.status(400).json({message: 'Faltan datos para enviar el reporte'});
  }
  try {
    await sendReportPdfEmail(correoDestino.trim(), titulo || 'Reporte Cafebar', htmlContent);
    return res.json({message: 'Reporte enviado por correo correctamente'});
  } 
  catch (error) {
    console.error(error);
    return res.status(500).json({message: 'No se pudo enviar el reporte por correo'});
  }
};