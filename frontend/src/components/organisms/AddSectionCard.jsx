import {Plus} from 'lucide-react';

const styles = {
  card: 'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-5 text-center text-slate-400 transition-colors hover:border-blue-400 hover:text-blue-500'
};

export const AddSectionCard = ({onClick}) => {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <Plus size={28} />
      <span className="text-sm font-bold">AÑADIR SECCIÓN</span>
    </button>
  );
};