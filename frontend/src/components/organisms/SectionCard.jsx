import {LayoutGrid} from 'lucide-react';
import {colors} from '../../constants/theme';

const styles = {
  card: 'flex cursor-pointer flex-col items-center gap-3 rounded-xl bg-white p-5 text-center shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md',
  icon: 'flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600',
  name: `font-bold ${colors.textPrimary}`,
  count: 'text-xs text-slate-500'
};

export const SectionCard = ({section, onClick}) => {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.icon}>
        <LayoutGrid size={28} />
      </div>
      <span className={styles.name}>{section.nomb_seccion}</span>
      <span className={styles.count}>{section.mesas_count} mesa{section.mesas_count === 1 ? '' : 's'}</span>
    </button>
  );
};