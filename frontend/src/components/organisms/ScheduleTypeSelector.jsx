const styles = {
  wrapper: 'grid grid-cols-2 gap-2 sm:grid-cols-4',
  option: 'rounded-lg border-2 px-3 py-2 text-center text-sm font-bold transition-colors',
  active: 'border-blue-500 bg-blue-50 text-blue-700',
  inactive: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
};

const OPTIONS = [
  { value: 'always', label: 'Siempre activa' },
  { value: 'specific', label: 'Fecha específica' },
  { value: 'range', label: 'Rango de fechas' },
  { value: 'recurring', label: 'Días recurrentes' }
];

export const ScheduleTypeSelector = ({ value, onChange }) => {
  return (
    <div className={styles.wrapper}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.option} ${value === option.value ? styles.active : styles.inactive}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};