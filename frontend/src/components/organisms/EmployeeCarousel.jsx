import {ChevronLeft, ChevronRight} from 'lucide-react';
import {Avatar} from '../atoms/Avatar';
import {IconButton} from '../atoms/IconButton';
import {usePagination} from '../../hooks/usePagination';
import {useMediaQuery} from '../../hooks/useMediaQuery';

const PAGE_SIZE_MOBILE = 5;
const PAGE_SIZE_DESKTOP = 7;

const styles = {
  wrapper: 'flex w-full max-w-2xl items-center gap-1 rounded-lg bg-slate-50 p-1 sm:gap-2 sm:p-2',
  list: 'grid min-w-0 flex-1 gap-1 sm:gap-2'
};

export const EmployeeCarousel = ({employees, onSelect}) => {
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const pageSize = isDesktop ? PAGE_SIZE_DESKTOP : PAGE_SIZE_MOBILE;
  const {visible, goLeft, goRight, canGoLeft, canGoRight} = usePagination(employees, pageSize);
  return (
    <div className={styles.wrapper}>
      <IconButton icon={ChevronLeft} size={18} onClick={goLeft} disabled={!canGoLeft} />
      <div className={styles.list} style={{ gridTemplateColumns: `repeat(${pageSize}, minmax(0, 1fr))` }}>
        {visible.map((employee) => (
          <Avatar
            key={employee.alias_emp}
            src={employee.img_emp}
            alt={employee.alias_emp}
            onClick={() => onSelect(employee.alias_emp)}
          />
        ))}
      </div>
      <IconButton icon={ChevronRight} size={18} onClick={goRight} disabled={!canGoRight} />
    </div>
  );
};