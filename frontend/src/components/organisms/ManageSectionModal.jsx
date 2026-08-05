import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { TextInput } from '../atoms/TextInput';
import { Toast } from '../atoms/Toast';
import { FormField } from '../molecules/FormField';
import { TablesGrid } from './TablesGrid';
import { useManageSection } from '../../features/sections/hooks/useManageSection';

const styles = {
  header: 'mb-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-white/80',
  title: 'text-lg font-bold text-white sm:text-xl',
  form: 'grid grid-cols-1 gap-4 sm:grid-cols-3',
  actions: 'mt-4 flex flex-col gap-2 sm:flex-row',
  previewLabel: 'mb-2 mt-6 text-sm font-bold text-slate-600',
  preview: 'max-h-72 overflow-y-auto rounded-lg border border-slate-100 p-2'
};

export const ManageSectionModal = ({ section, onClose, onUpdated }) => {
  const { nombre, setNombre, descripcion, setDescripcion, cantidadMesas, setCantidadMesas, ready, error, loading, handleSubmit } = useManageSection(section, onUpdated);

  return (
    <Modal onClose={onClose} size="lg">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Sección</p>
        <h2 className={styles.title}>{section.nomb_seccion}</h2>
      </div>
      {ready && (
        <form onSubmit={handleSubmit}>
          <div className={styles.form}>
            <FormField label="NOMBRE DE SECCIÓN">
              <TextInput value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={17} />
            </FormField>
            <FormField label="DESCRIPCIÓN">
              <TextInput value={descripcion} onChange={(event) => setDescripcion(event.target.value)} maxLength={40} />
            </FormField>
            <FormField label="NÚMERO DE MESAS">
              <TextInput value={cantidadMesas} onChange={(event) => setCantidadMesas(event.target.value.replace(/\D/g, ''))} maxLength={4} />
            </FormField>
          </div>

          <p className={styles.previewLabel}>Vista previa de mesas</p>
          <div className={styles.preview}>
            <TablesGrid count={Number(cantidadMesas) || 0} />
          </div>

          <div className={styles.actions}>
            <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'GUARDANDO...' : 'MODIFICAR'}</Button>
            <Button type="button" variant="danger" className="flex-1" onClick={onClose}>VOLVER</Button>
          </div>
        </form>
      )}
      {error && <Toast>{error}</Toast>}
    </Modal>
  );
};