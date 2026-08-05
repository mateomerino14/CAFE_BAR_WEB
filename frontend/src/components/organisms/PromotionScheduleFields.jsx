import { TextInput } from '../atoms/TextInput';
import { Checkbox } from '../atoms/Checkbox';
import { FormField } from '../molecules/FormField';
import { DaysSelector } from '../molecules/DaysSelector';
import { ScheduleTypeSelector } from './ScheduleTypeSelector';
import { colors } from '../../constants/theme';

const styles = {
  wrapper: 'flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4',
  grid: 'grid grid-cols-1 gap-3 sm:grid-cols-2',
  info: `text-sm ${colors.textSecondary}`
};

export const PromotionScheduleFields = ({ schedule, onChange, days, onToggleDay }) => {
  return (
    <div className={styles.wrapper}>
      <ScheduleTypeSelector value={schedule.scheduleType} onChange={(value) => onChange('scheduleType', value)} />

      {schedule.scheduleType === 'always' && (
        <p className={styles.info}>Esta promoción estará disponible en todo momento, sin restricción de fecha u horario.</p>
      )}

      {schedule.scheduleType === 'specific' && (
        <div className={styles.grid}>
          <FormField label="FECHA">
            <TextInput type="date" value={schedule.fechaEspecifica} onChange={(event) => onChange('fechaEspecifica', event.target.value)} />
          </FormField>
          <div className={styles.grid}>
            <FormField label="HORA INICIO">
              <TextInput type="time" value={schedule.horaInicio} onChange={(event) => onChange('horaInicio', event.target.value)} />
            </FormField>
            <FormField label="HORA FIN">
              <TextInput type="time" value={schedule.horaFin} onChange={(event) => onChange('horaFin', event.target.value)} />
            </FormField>
          </div>
        </div>
      )}

      {schedule.scheduleType === 'range' && (
        <>
          <div className={styles.grid}>
            <FormField label="DESDE">
              <TextInput type="date" value={schedule.fechaInicio} onChange={(event) => onChange('fechaInicio', event.target.value)} />
            </FormField>
            <FormField label="HASTA">
              <TextInput type="date" value={schedule.fechaFin} onChange={(event) => onChange('fechaFin', event.target.value)} />
            </FormField>
            <FormField label="HORA INICIO">
              <TextInput type="time" value={schedule.horaInicio} onChange={(event) => onChange('horaInicio', event.target.value)} />
            </FormField>
            <FormField label="HORA FIN">
              <TextInput type="time" value={schedule.horaFin} onChange={(event) => onChange('horaFin', event.target.value)} />
            </FormField>
          </div>
          <Checkbox
            label="Restringir a días específicos de la semana"
            checked={schedule.daysEnabled}
            onChange={(event) => onChange('daysEnabled', event.target.checked)}
          />
          {schedule.daysEnabled && <DaysSelector selectedDays={days} onToggle={onToggleDay} />}
        </>
      )}

      {schedule.scheduleType === 'recurring' && (
        <>
          <div className={styles.grid}>
            <FormField label="HORA INICIO">
              <TextInput type="time" value={schedule.horaInicio} onChange={(event) => onChange('horaInicio', event.target.value)} />
            </FormField>
            <FormField label="HORA FIN">
              <TextInput type="time" value={schedule.horaFin} onChange={(event) => onChange('horaFin', event.target.value)} />
            </FormField>
          </div>
          <DaysSelector selectedDays={days} onToggle={onToggleDay} />
        </>
      )}
    </div>
  );
};