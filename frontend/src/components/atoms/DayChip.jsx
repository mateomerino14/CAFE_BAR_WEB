const styles = {
  base: 'flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
  active: 'border-blue-500 bg-blue-500 text-white',
  inactive: 'border-slate-300 bg-white text-slate-500 hover:border-slate-400'
};

export const DayChip = ({ label, active, onClick }) => {
  return (
    <button type="button" onClick={onClick} className={`${styles.base} ${active ? styles.active : styles.inactive}`}>
      {label}
    </button>
  );
};