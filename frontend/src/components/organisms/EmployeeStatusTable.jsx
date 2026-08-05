import { Power } from 'lucide-react';
import { Avatar } from '../atoms/Avatar';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[600px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  statusWrapper: 'flex items-center gap-2 whitespace-nowrap',
  statusDot: 'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
  statusActive: 'bg-emerald-500',
  statusInactive: 'bg-red-500',
  statusLabel: 'text-xs font-semibold',
  toggleActive: 'flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600',
  toggleInactive: 'flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600'
};

export const EmployeeStatusTable = ({ employees, onToggle }) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            <th className={styles.th}>Nombre completo</th>
            <th className={styles.th}>Alias</th>
            <th className={styles.th}>Cargo</th>
            <th className={styles.th}>Estado</th>
            <th className={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.cod_emp}>
              <td className={styles.td}>
                <Avatar src={employee.img_emp} alt={employee.alias_emp} className="pointer-events-none h-10 w-10" />
              </td>
              <td className={`${styles.td} ${styles.name}`}>{employee.nom_emp} {employee.apell_pat_emp} {employee.apell_mat_emp}</td>
              <td className={styles.td}>{employee.alias_emp}</td>
              <td className={styles.td}>{employee.cargo?.nom_carg}</td>
              <td className={styles.td}>
                <div className={styles.statusWrapper}>
                  <span className={`${styles.statusDot} ${employee.disponible_emp ? styles.statusActive : styles.statusInactive}`} />
                  <span className={styles.statusLabel}>{employee.disponible_emp ? 'Habilitado' : 'Deshabilitado'}</span>
                </div>
              </td>
              <td className={styles.td}>
                <button
                  type="button"
                  className={employee.disponible_emp ? styles.toggleActive : styles.toggleInactive}
                  onClick={() => onToggle(employee)}
                >
                  <Power size={14} /> {employee.disponible_emp ? 'DESHABILITAR' : 'HABILITAR'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};