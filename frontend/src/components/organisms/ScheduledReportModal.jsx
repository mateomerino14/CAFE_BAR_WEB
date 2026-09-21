import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Toast } from '../atoms/Toast';
import { FormField } from '../molecules/FormField';
import { SearchableSelect } from '../molecules/SearchableSelect';
import { useScheduledReport } from '../../features/config/hooks/useScheduledReport';

const DIAS = [
  { value: '0', label: 'Domingo' },
  { value: '1', label: 'Lunes' },
  { value: '2', label: 'Martes' },
  { value: '3', label: 'Miércoles' },
  { value: '4', label: 'Jueves' },
  { value: '5', label: 'Viernes' },
  { value: '6', label: 'Sábado' }
];

const styles = {
  title: 'text-lg font-bold text-slate-800',
  section: 'mt-4 flex flex-col gap-3',
  hint: 'text-xs text-slate-500',
  back: 'mt-5'
};

export const ScheduledReportModal = ({ onClose }) => {
  const { email, setEmail, diaSemana, setDiaSemana, hora, setHora, loading, saving, testing, handleSave, handleTest, error, success } = useScheduledReport();

  return (
    <Modal onClose={onClose} size="sm">
      <h2 className={styles.title}>Reporte Automático Semanal</h2>
      <p className={styles.hint}>
        Cada semana, en el día y hora que elijas, se envía automáticamente el reporte de "Productos y Promociones" de los últimos 7 días al correo indicado. Si el sistema está apagado a esa hora, se envía apenas vuelva a encenderse.
      </p>

      {loading ? (
        <p className={styles.hint}>Cargando...</p>
      ) : (
        <div className={styles.section}>
          <FormField label="CORREO DE DESTINO">
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.com" />
          </FormField>
          <FormField label="DÍA DE LA SEMANA">
            <SearchableSelect options={DIAS} value={diaSemana} onChange={setDiaSemana} placeholder="Seleccione un día" />
          </FormField>
          <FormField label="HORA">
            <TextInput type="time" value={hora} onChange={(event) => setHora(event.target.value)} />
          </FormField>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'GUARDANDO...' : 'GUARDAR'}
          </Button>
          <Button type="button" variant="warning" onClick={handleTest} disabled={testing}>
            {testing ? 'ENVIANDO...' : 'ENVIAR DE PRUEBA AHORA'}
          </Button>
          <p className={styles.hint}>
            El botón de prueba envía el reporte de inmediato, sin esperar al día/hora programados, y sin afectar el envío automático real.
          </p>
        </div>
      )}

      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CERRAR</Button>
      {error && <Toast>{error}</Toast>}
      {success && <Toast variant="success">{success}</Toast>}
    </Modal>
  );
};
