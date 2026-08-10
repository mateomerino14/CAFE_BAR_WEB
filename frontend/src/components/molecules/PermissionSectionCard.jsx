import {Checkbox} from '../atoms/Checkbox';
import {colors} from '../../constants/theme';

const styles = {
  wrapper: 'rounded-lg border border-slate-200 bg-slate-50 p-3',
  header: 'mb-2 flex flex-wrap items-center justify-between gap-2',
  title: `text-sm font-bold ${colors.textPrimary}`,
  actions: 'flex gap-1.5 text-xs font-semibold',
  selectAll: 'rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 transition-colors hover:bg-emerald-200',
  selectNone: 'rounded-full bg-red-100 px-2.5 py-1 text-red-700 transition-colors hover:bg-red-200',
  grid: 'grid grid-cols-1 gap-2 sm:grid-cols-2'
};

export const PermissionSectionCard = ({screenName, subpantallas, selectedIds, onToggle, onSelectAll, onSelectNone}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>{screenName}</span>
        <div className={styles.actions}>
          <button type="button" className={styles.selectAll} onClick={onSelectAll}>Todas</button>
          <button type="button" className={styles.selectNone} onClick={onSelectNone}>Ninguna</button>
        </div>
      </div>
      <div className={styles.grid}>
        {subpantallas.map((sub) => (
          <Checkbox
            key={sub.id_sub_pant}
            label={sub.nom_sub_pant}
            checked={selectedIds.includes(sub.id_sub_pant)}
            onChange={() => onToggle(sub.id_sub_pant)}
          />
        ))}
      </div>
    </div>
  );
};