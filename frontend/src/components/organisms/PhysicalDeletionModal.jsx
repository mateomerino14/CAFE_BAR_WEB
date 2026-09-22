import {Modal} from '../atoms/Modal';
import {Button} from '../atoms/Button';
import {Toast} from '../atoms/Toast';
import {Pagination} from '../molecules/Pagination';
import {DeletionTable} from './DeletionTable';
import {DeletionSelectionControls} from './DeletionSelectionControls';
import {DeletionConfirmModal} from './DeletionConfirmModal';
import {usePhysicalDeletion} from '../../features/config/hooks/usePhysicalDeletion';
import {usePagination} from '../../hooks/usePagination';

const PAGE_SIZE = 5;

const formatFecha = (fecha) => {
  if (!fecha) return '';
  const soloFecha = fecha.slice(0, 10);
  const [anio, mes, dia] = soloFecha.split('-');
  return `${dia}/${mes}/${anio}`;
};

const formatHora = (hora) => {
  if (!hora) return '';
  const [horaStr, minutoStr] = hora.split(':');
  const horaNum = Number(horaStr);
  const periodo = horaNum >= 12 ? 'PM' : 'AM';
  const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
  return `${hora12}:${minutoStr} ${periodo}`;
};

const styles = {
  title: 'text-lg font-bold text-slate-800',
  tabsRow: 'mt-4 flex flex-wrap gap-2',
  tabButton: 'rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors',
  tabActive: 'border-red-500 bg-red-50 text-red-700',
  tabInactive: 'border-slate-200 bg-white text-slate-500',
  filterRow: 'mt-3 flex gap-2',
  filterButton: 'rounded-full px-3 py-1.5 text-xs font-bold text-white',
  filterActive: 'ring-2 ring-offset-1 ring-slate-800',
  content: 'mt-3 flex flex-col gap-3',
  footer: 'mt-4 flex flex-col gap-2',
  loading: 'p-6 text-center text-sm text-blue-500'
};

const TABS = [
  {key: 'empleados', label: 'Empleados'},
  {key: 'cargos', label: 'Cargos'},
  {key: 'secciones', label: 'Secciones'},
  {key: 'ventas', label: 'Ventas'}
];

export const PhysicalDeletionModal = ({onClose}) => {
  const {
    activeTab, setActiveTab,
    data, loading,
    filtroEmpleados, setFiltroEmpleados,
    selected, toggleSelected, selectAll, deselectAll, invertSelection,
    totalSelected,
    tree, confirming, setConfirming, executing,
    handleRequestDelete, handleConfirmDelete,
    error, success
  } = usePhysicalDeletion();

  const empleadosColumns = [
    {key: 'codEmp', label: 'Código'},
    {key: 'nombreCompleto', label: 'Nombre Completo'},
    {key: 'alias', label: 'Alias'},
    {key: 'ci', label: 'CI'},
    {key: 'cargo', label: 'Cargo'},
    {key: 'disponible', label: 'Disponible', render: (r) => (r.disponible ? 'Sí' : 'No')}
  ];

  const cargosColumns = [
    {key: 'idCargo', label: 'ID'},
    {key: 'nombre', label: 'Nombre del Cargo'},
    {key: 'numEmpleados', label: 'Empleados'}
  ];

  const seccionesColumns = [
    {key: 'idSeccion', label: 'ID'},
    {key: 'nombre', label: 'Nombre'},
    {key: 'numMesas', label: 'Mesas'},
    {key: 'numVentas', label: 'Ventas Asociadas'}
  ];

  const ventasColumns = [
    {key: 'numVenta', label: 'N° Venta'},
    {key: 'fecha', label: 'Fecha', render: (r) => formatFecha(r.fecha)},
    {key: 'hora', label: 'Hora', render: (r) => formatHora(r.hora)},
    {key: 'total', label: 'Total', render: (r) => `Bs ${Number(r.total).toFixed(2)}`},
    {key: 'mesa', label: 'Mesa'},
    {key: 'seccion', label: 'Sección'},
    {key: 'estado', label: 'Estado'}
  ];

  const currentRows = data[activeTab] || [];
  const getIdFor = {
    empleados: (r) => r.codEmp,
    cargos: (r) => r.idCargo,
    secciones: (r) => r.idSeccion,
    ventas: (r) => r.idVenta
  }[activeTab];

  const columnsFor = { empleados: empleadosColumns, cargos: cargosColumns, secciones: seccionesColumns, ventas: ventasColumns }[activeTab];
  const allIds = currentRows.map(getIdFor);
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(currentRows, PAGE_SIZE);

  return (
    <>
      <Modal onClose={onClose} size="xl">
        <h2 className={styles.title}>Eliminación Física de Registros</h2>
        <div className={styles.tabsRow}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.tabActive : styles.tabInactive}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({selected[tab.key].size})
            </button>
          ))}
        </div>
        {activeTab === 'empleados' && (
          <div className={styles.filterRow}>
            <button type="button" className={`${styles.filterButton} bg-slate-700 ${filtroEmpleados === 'todas' ? styles.filterActive : ''}`} onClick={() => setFiltroEmpleados('todas')}>Todas</button>
            <button type="button" className={`${styles.filterButton} bg-emerald-500 ${filtroEmpleados === 'activas' ? styles.filterActive : ''}`} onClick={() => setFiltroEmpleados('activas')}>Activas</button>
            <button type="button" className={`${styles.filterButton} bg-slate-400 ${filtroEmpleados === 'inactivas' ? styles.filterActive : ''}`} onClick={() => setFiltroEmpleados('inactivas')}>Inactivas</button>
          </div>
        )}
        <div className={styles.content}>
          <DeletionSelectionControls
            onSelectAll={() => selectAll(activeTab, allIds)}
            onDeselectAll={() => deselectAll(activeTab)}
            onInvert={() => invertSelection(activeTab, allIds)}
          />
          {loading ? (
            <p className={styles.loading}>Cargando...</p>
          ) : (
            <>
              <DeletionTable
                columns={columnsFor}
                rows={visible}
                getId={getIdFor}
                isSelected={(id) => selected[activeTab].has(id)}
                onToggle={(id) => toggleSelected(activeTab, id)}
                hasWarning={activeTab === 'cargos' ? (r) => r.numEmpleados > 0 : activeTab === 'secciones' ? (r) => r.numMesas > 0 || r.numVentas > 0 : null}
              />
              {currentRows.length > PAGE_SIZE && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  canGoLeft={canGoLeft}
                  canGoRight={canGoRight}
                  onPrev={goLeft}
                  onNext={goRight}
                />
              )}
            </>
          )}
        </div>
        <div className={styles.footer}>
          <Button type="button" variant="danger" onClick={handleRequestDelete} disabled={totalSelected === 0}>
            ELIMINAR {totalSelected} SELECCIONADO(S)
          </Button>
          <Button type="button" onClick={onClose}>CERRAR</Button>
        </div>
        {error && <Toast>{error}</Toast>}
        {success && <Toast variant="success">{success}</Toast>}
      </Modal>
      {confirming && (
        <DeletionConfirmModal
          tree={tree}
          totalSelected={totalSelected}
          executing={executing}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
};