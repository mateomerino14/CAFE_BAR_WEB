import {Pencil} from 'lucide-react';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[600px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-top',
  screenLine: 'mb-1 text-xs text-slate-600',
  screenName: 'font-bold text-slate-800',
  editButton: `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${colors.buttonPrimary}`
};

export const RoleTable = ({roles, onEdit}) => {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Cargo</th>
            <th className={styles.th}>Accesos por sección</th>
            <th className={styles.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id_cargo}>
              <td className={styles.td}>{role.nom_carg}</td>
              <td className={styles.td}>
                {Object.entries(role.permissions).map(([screenName, subs]) => (
                  <p key={screenName} className={styles.screenLine}>
                    <span className={styles.screenName}>{screenName}:</span> {subs.join(', ')}
                  </p>
                ))}
              </td>
              <td className={styles.td}>
                <button type="button" className={styles.editButton} onClick={() => onEdit(role)}>
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