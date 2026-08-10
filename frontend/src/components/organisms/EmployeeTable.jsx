import {Pencil} from 'lucide-react';
import {Avatar} from '../atoms/Avatar';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[700px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  name: 'font-semibold text-slate-800',
  editButton: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${colors.buttonPrimary}`
};

export const EmployeeTable = ({employees, onEdit}) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            <th className={styles.th}>Nombre completo</th>
            <th className={styles.th}>Alias</th>
            <th className={styles.th}>Cargo</th>
            <th className={styles.th}>Celular</th>
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
              <td className={styles.td}>{employee.num_cel_emp}</td>
              <td className={styles.td}>
                <button type="button" className={styles.editButton} onClick={() => onEdit(employee)}>
                  <Pencil size={14} /> EDITAR
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};