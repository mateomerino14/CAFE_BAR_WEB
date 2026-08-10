import {ChevronLeft, ChevronRight} from 'lucide-react';
import {IconButton} from '../atoms/IconButton';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'flex items-center justify-center gap-4',
  button: 'rounded-full border border-slate-200 p-1.5 hover:bg-slate-100',
  text: `text-sm font-semibold ${colors.textPrimary}`
};

export const Pagination = ({currentPage, totalPages, canGoLeft, canGoRight, onPrev, onNext}) => {
  if (totalPages <= 1) return null;
  return (
    <div className={styles.wrapper}>
      <IconButton icon={ChevronLeft} size={20} onClick={onPrev} disabled={!canGoLeft} className={styles.button} />
      <span className={styles.text}>Página {currentPage} de {totalPages}</span>
      <IconButton icon={ChevronRight} size={20} onClick={onNext} disabled={!canGoRight} className={styles.button} />
    </div>
  );
};