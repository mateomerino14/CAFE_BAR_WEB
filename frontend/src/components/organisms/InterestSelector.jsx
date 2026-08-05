const styles = {
  wrapper: 'flex gap-3',
  option: 'flex-1 rounded-lg border-2 px-4 py-3 text-center text-sm font-bold transition-colors',
  active: 'border-blue-500 bg-blue-50 text-blue-700',
  inactive: 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
};

export const InterestSelector = ({ value, onChange }) => {
  return (
    <div className={styles.wrapper}>
      <button type="button" className={`${styles.option} ${value === 'promotions' ? styles.active : styles.inactive}`} onClick={() => onChange('promotions')}>
        Promociones
      </button>
      <button type="button" className={`${styles.option} ${value === 'products' ? styles.active : styles.inactive}`} onClick={() => onChange('products')}>
        Productos
      </button>
    </div>
  );
};