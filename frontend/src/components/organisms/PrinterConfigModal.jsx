import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Toast } from '../atoms/Toast';
import { FormField } from '../molecules/FormField';
import { SearchableSelect } from '../molecules/SearchableSelect';
import { usePrinterConfig } from '../../features/config/hooks/usePrinterConfig';

const styles = {
  title: 'text-lg font-bold text-slate-800',
  section: 'mt-4 rounded-xl border border-slate-200 p-4',
  sectionTitle: 'text-sm font-bold text-slate-700',
  sectionBody: 'mt-2 flex flex-col gap-3',
  hint: 'text-xs text-slate-500',
  statusBadge: 'inline-block rounded px-2 py-1 text-xs font-bold',
  statusConnected: 'bg-emerald-100 text-emerald-700',
  statusFailed: 'bg-red-100 text-red-700',
  back: 'mt-5'
};

export const PrinterConfigModal = ({ onClose }) => {
  const {
    connectionStatus, handleTestConnection,
    printers, ticketPrinter, setTicketPrinter, cocinaPrinter, setCocinaPrinter,
    saving, handleSaveAssignment,
    error, success
  } = usePrinterConfig();

  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>Configurar Impresoras</h2>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Impresoras de esta computadora</p>
        <div className={styles.sectionBody}>
          <Button type="button" variant="warning" onClick={handleTestConnection} disabled={connectionStatus === 'checking'}>
            {connectionStatus === 'checking' ? 'BUSCANDO...' : 'BUSCAR IMPRESORAS'}
          </Button>
          <p className={styles.hint}>
            Si conectaste una impresora nueva, presiona este botón para que aparezca en las listas de abajo.
          </p>
          {connectionStatus === 'connected' && <span className={`${styles.statusBadge} ${styles.statusConnected}`}>Encontradas</span>}
          {connectionStatus === 'failed' && <span className={`${styles.statusBadge} ${styles.statusFailed}`}>No se pudo obtener la lista de impresoras</span>}
        </div>
      </div>

      {connectionStatus === 'connected' && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Asignar impresoras</p>
          <div className={styles.sectionBody}>
            <FormField label="IMPRESORA PARA TICKET (CLIENTE)">
              <SearchableSelect
                options={printers.map((name) => ({ value: name, label: name }))}
                value={ticketPrinter}
                onChange={setTicketPrinter}
                placeholder="Seleccione una impresora"
              />
            </FormField>
            <FormField label="IMPRESORA PARA COCINA">
              <SearchableSelect
                options={printers.map((name) => ({ value: name, label: name }))}
                value={cocinaPrinter}
                onChange={setCocinaPrinter}
                placeholder="Seleccione una impresora"
              />
            </FormField>
            <Button type="button" onClick={handleSaveAssignment} disabled={saving}>
              {saving ? 'GUARDANDO...' : 'GUARDAR ASIGNACIÓN'}
            </Button>
          </div>
        </div>
      )}

      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </Modal>
  );
};
