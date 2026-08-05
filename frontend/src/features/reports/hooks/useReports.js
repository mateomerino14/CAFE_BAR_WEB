import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import {
  getReportEmployees, getDetailedSalesReport, getSummaryByDateReport,
  getTopProductsReport, getEmployeeChartReport, sendReportEmail
} from '../services/reportsService';
import {
  buildDetailedReportHtml, buildSummaryByDateReportHtml, buildTopProductsReportHtml,
  buildEmployeePieReportHtml, printReportHtml
} from '../utils/reportHtml';

const todayStr = () => new Date().toISOString().slice(0, 10);

const TITULOS = {
  detallado: 'Ventas Detalladas',
  resumen_fechas: 'Resumen por Fechas',
  productos_vendidos: 'Productos Más Vendidos',
  resumen_empleado: 'Resumen por Empleado'
};

export const useReports = () => {
  const [subreporte, setSubreporte] = useState('detallado');
  const [fechaInicio, setFechaInicio] = useState(todayStr());
  const [fechaFin, setFechaFin] = useState(todayStr());
  const [empleados, setEmpleados] = useState([]);
  const [filtrarEmpleado, setFiltrarEmpleado] = useState(false);
  const [empleadoId, setEmpleadoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const [detalladoRows, setDetalladoRows] = useState([]);
  const [resumenFechasResult, setResumenFechasResult] = useState({ rows: [], granTotal: 0 });
  const [productosRows, setProductosRows] = useState([]);
  const [empleadoCajeroRows, setEmpleadoCajeroRows] = useState([]);
  const [empleadoMeseroRows, setEmpleadoMeseroRows] = useState([]);

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  useEffect(() => {
    getReportEmployees().then(setEmpleados).catch(() => setEmpleados([]));
  }, []);

  const periodo = `${fechaInicio} al ${fechaFin}`;

  const generar = async () => {
    setError('');
    if (!fechaInicio || !fechaFin) {
      setError('Seleccione un rango de fechas');
      return;
    }
    setLoading(true);
    try {
      const empId = filtrarEmpleado && empleadoId !== '' ? empleadoId : undefined;

      if (subreporte === 'detallado') {
        const rows = await getDetailedSalesReport(fechaInicio, fechaFin, empId);
        setDetalladoRows(rows);
      } else if (subreporte === 'resumen_fechas') {
        const result = await getSummaryByDateReport(fechaInicio, fechaFin, empId);
        setResumenFechasResult(result);
      } else if (subreporte === 'productos_vendidos') {
        const rows = await getTopProductsReport(fechaInicio, fechaFin);
        setProductosRows(rows);
      } else if (subreporte === 'resumen_empleado') {
        const [cajeroRows, meseroRows] = await Promise.all([
          getEmployeeChartReport(fechaInicio, fechaFin, 'cajero'),
          getEmployeeChartReport(fechaInicio, fechaFin, 'mesero')
        ]);
        setEmpleadoCajeroRows(cajeroRows);
        setEmpleadoMeseroRows(meseroRows);
      }
      setHasGenerated(true);
    } catch (err) {
      setError('No se pudo generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setFechaInicio(todayStr());
    setFechaFin(todayStr());
    setFiltrarEmpleado(false);
    setEmpleadoId('');
    setHasGenerated(false);
  };

  const buildCurrentHtml = () => {
    if (subreporte === 'detallado') return buildDetailedReportHtml(detalladoRows, periodo);
    if (subreporte === 'resumen_fechas') return buildSummaryByDateReportHtml(resumenFechasResult.rows, resumenFechasResult.granTotal, periodo);
    if (subreporte === 'productos_vendidos') return buildTopProductsReportHtml(productosRows, periodo);
    if (subreporte === 'resumen_empleado') return buildEmployeePieReportHtml(empleadoCajeroRows, empleadoMeseroRows, periodo);
    return '';
  };

  const handlePrint = () => {
    if (!hasGenerated) {
      setError('Primero genere el reporte');
      return;
    }
    printReportHtml(buildCurrentHtml());
  };

  const handleSendEmail = async (correoDestino) => {
    setError('');
    if (!hasGenerated) {
      setError('Primero genere el reporte');
      return false;
    }
    if (!correoDestino.trim()) {
      setError('Ingrese el correo de destino');
      return false;
    }
    setSendingEmail(true);
    try {
      await sendReportEmail(correoDestino.trim(), TITULOS[subreporte] || 'Reporte Cafebar', buildCurrentHtml());
      setSuccess('Reporte enviado por correo correctamente');
      return true;
    } catch (err) {
      setError('No se pudo enviar el reporte por correo');
      return false;
    } finally {
      setSendingEmail(false);
    }
  };

  return {
    subreporte, setSubreporte,
    fechaInicio, setFechaInicio,
    fechaFin, setFechaFin,
    empleados, filtrarEmpleado, setFiltrarEmpleado, empleadoId, setEmpleadoId,
    loading, sendingEmail, error, success, hasGenerated,
    detalladoRows, resumenFechasResult, productosRows, empleadoCajeroRows, empleadoMeseroRows,
    generar, limpiarFiltros, handlePrint, handleSendEmail
  };
};