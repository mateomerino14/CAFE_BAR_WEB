import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Checkbox } from '../atoms/Checkbox';
import { FormField } from '../molecules/FormField';
import { SearchableSelect } from '../molecules/SearchableSelect';

const styles = {
  wrapper: 'flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm',
  row: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  actions: 'flex flex-wrap gap-2'
};

const SUBREPORTES = [
  { value: 'detallado', label: 'Ventas Detalladas' },
  { value: 'resumen_fechas', label: 'Resumen por Fechas' },
  { value: 'resumen_empleado', label: 'Resumen por Empleado' },
  { value: 'productos_vendidos', label: 'Productos y Promociones (Ganancia)' }
];

export const ReportFilters = ({
  subreporte, setSubreporte,
  fechaInicio, setFechaInicio,
  fechaFin, setFechaFin,
  empleados, filtrarEmpleado, setFiltrarEmpleado, empleadoId, setEmpleadoId,
  loading, onGenerar, onLimpiar
}) => {
  const permiteFiltrarEmpleado = subreporte === 'detallado' || subreporte === 'resumen_fechas';

  return (
    <div className={styles.wrapper}>
      <FormField label="TIPO DE ANÁLISIS">
        <SearchableSelect
          options={SUBREPORTES}
          value={subreporte}
          onChange={setSubreporte}
          placeholder="Seleccione un tipo de reporte"
        />
      </FormField>

      <div className={styles.row}>
        <FormField label="DESDE">
          <TextInput type="date" value={fechaInicio} onChange={(event) => setFechaInicio(event.target.value)} />
        </FormField>
        <FormField label="HASTA">
          <TextInput type="date" value={fechaFin} onChange={(event) => setFechaFin(event.target.value)} />
        </FormField>
      </div>

      {permiteFiltrarEmpleado && (
        <Checkbox
          label="Filtrar por empleado (cajero)"
          checked={filtrarEmpleado}
          onChange={() => setFiltrarEmpleado((prev) => !prev)}
        />
      )}

      {permiteFiltrarEmpleado && filtrarEmpleado && (
        <FormField label="EMPLEADO">
          <SearchableSelect
            options={empleados.map((e) => ({ value: e.codEmp, label: e.alias }))}
            value={empleadoId}
            onChange={setEmpleadoId}
            placeholder="Buscar empleado"
          />
        </FormField>
      )}

      <div className={styles.actions}>
        <Button type="button" onClick={onGenerar} disabled={loading}>{loading ? 'GENERANDO...' : 'GENERAR REPORTE'}</Button>
        <Button type="button" variant="warning" onClick={onLimpiar}>LIMPIAR FILTROS</Button>
      </div>
    </div>
  );
};