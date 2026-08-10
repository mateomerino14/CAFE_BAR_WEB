import {Check} from 'lucide-react';

const styles = {
  label: 'flex cursor-pointer select-none items-center gap-2 text-sm text-slate-700',
  input: 'sr-only',
  box: 'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
  boxChecked: 'border-blue-500 bg-blue-500',
  boxUnchecked: 'border-slate-300 bg-white hover:border-slate-400'
};

export const Checkbox = ({label, checked, onChange}) => {
  return (
    <label className={styles.label}>
      <input type="checkbox" className={styles.input} checked={checked} onChange={onChange} />
      <span className={`${styles.box} ${checked ? styles.boxChecked : styles.boxUnchecked}`}>
        {checked && <Check size={13} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </label>
  );
};