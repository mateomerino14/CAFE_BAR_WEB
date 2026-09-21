import { useState } from 'react';
import { MainLayout } from '../../../components/templates/MainLayout';
import { Toast } from '../../../components/atoms/Toast';
import { ReportFilters } from '../../../components/organisms/ReportFilters';
import { ReportActions } from '../../../components/organisms/ReportActions';
import { DetailedSalesTable, SummaryByDateTable, TopProductsTable } from '../../../components/organisms/ReportTables';
import { EmployeePieChart } from '../../../components/organisms/EmployeePieChart';
import { SaleDetailsModal } from '../../../components/organisms/SaleDetailsModal';
import { TopProductsDetailModal } from '../../../components/organisms/TopProductsDetailModal';
import { useReports } from '../hooks/useReports';

const styles = {
  wrapper: 'flex flex-col gap-4',
  pieGrid: 'mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2'
};

export const ReportsPage = () => {
  const {
    subreporte, setSubreporte,
    fechaInicio, setFechaInicio,
    fechaFin, setFechaFin,
    empleados, filtrarEmpleado, setFiltrarEmpleado, empleadoId, setEmpleadoId,
    loading, sendingEmail, error, success, hasGenerated,
    detalladoRows, resumenFechasResult, productosRows, empleadoCajeroRows, empleadoMeseroRows,
    generar, limpiarFiltros, handlePrint, handleSendEmail
  } = useReports();

  const [selectedVenta, setSelectedVenta] = useState(null);
  const [selectedPromo, setSelectedPromo] = useState(null);

  return (
    <>
      <MainLayout title="REPORTES">
        <div className={styles.wrapper}>
          <ReportFilters
            subreporte={subreporte} setSubreporte={setSubreporte}
            fechaInicio={fechaInicio} setFechaInicio={setFechaInicio}
            fechaFin={fechaFin} setFechaFin={setFechaFin}
            empleados={empleados} filtrarEmpleado={filtrarEmpleado} setFiltrarEmpleado={setFiltrarEmpleado}
            empleadoId={empleadoId} setEmpleadoId={setEmpleadoId}
            loading={loading}
            onGenerar={generar}
            onLimpiar={limpiarFiltros}
          />

          {hasGenerated && (
            <>
              <ReportActions onPrint={handlePrint} onSendEmail={handleSendEmail} sendingEmail={sendingEmail} />

              {subreporte === 'detallado' && (
                <DetailedSalesTable rows={detalladoRows} onSelect={setSelectedVenta} />
              )}
              {subreporte === 'resumen_fechas' && <SummaryByDateTable result={resumenFechasResult} />}
              {subreporte === 'productos_vendidos' && <TopProductsTable rows={productosRows} onSelectPromo={setSelectedPromo} />}
              {subreporte === 'resumen_empleado' && (
                <div className={styles.pieGrid}>
                  <EmployeePieChart rows={empleadoCajeroRows} titulo="Ventas por Cajero" />
                  <EmployeePieChart rows={empleadoMeseroRows} titulo="Ventas por Mesero" />
                </div>
              )}
            </>
          )}
        </div>
      </MainLayout>
      {selectedVenta && (
        <SaleDetailsModal
          venta={{ idVenta: selectedVenta.idVenta, numVenta: selectedVenta.numVenta, mesa: selectedVenta.mesa, seccion: selectedVenta.seccion || selectedVenta.salon }}
          onClose={() => setSelectedVenta(null)}
        />
      )}
      {selectedPromo && (
        <TopProductsDetailModal item={selectedPromo} onClose={() => setSelectedPromo(null)} />
      )}
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </>
  );
};