import { Modal } from '../atoms/Modal';
import { Button } from '../atoms/Button';
import { Avatar } from '../atoms/Avatar';
import { Pagination } from '../molecules/Pagination';
import { usePagination } from '../../hooks/usePagination';

const PAGE_SIZE = 10;

const styles = {
  title: 'text-lg font-bold text-slate-800',
  grid: 'mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5',
  item: 'flex flex-col items-center gap-1',
  name: 'text-xs font-semibold text-slate-700',
  pagination: 'mt-4',
  back: 'mt-4',
  loading: 'mt-4 rounded-lg bg-slate-50 p-6 text-center text-sm font-semibold text-blue-500'
};

export const EmployeePickerModal = ({ employees, loading, onClose, onSelect }) => {
  const { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages } = usePagination(employees, PAGE_SIZE);

  return (
    <Modal onClose={onClose} size="lg">
      <h2 className={styles.title}>Elegir mesero</h2>
      {loading && <p className={styles.loading}>Cargando empleados...</p>}
      {!loading && (
        <>
          <div className={styles.grid}>
            {visible.map((employee) => (
              <div key={employee.cod_emp} className={styles.item}>
                <Avatar src={employee.img_emp} alt={employee.alias_emp} onClick={() => onSelect(employee)} />
                <span className={styles.name}>{employee.alias_emp}</span>
              </div>
            ))}
            {employees.length === 0 && <p className="text-sm text-slate-400">No hay empleados disponibles</p>}
          </div>
          <div className={styles.pagination}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              canGoLeft={canGoLeft}
              canGoRight={canGoRight}
              onPrev={goLeft}
              onNext={goRight}
            />
          </div>
        </>
      )}
      <Button type="button" variant="danger" className={styles.back} onClick={onClose}>CANCELAR</Button>
    </Modal>
  );
};