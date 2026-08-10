import {LayoutGrid} from 'lucide-react';

const styles = {
  wrapper: 'grid grid-cols-4 gap-3 sm:grid-cols-5',
  table: 'flex flex-col items-center gap-1 rounded-lg border-2 border-amber-800/40 bg-amber-50 p-3',
  number: 'text-xs font-bold text-amber-900'
};

export const TablesGrid = ({count}) => {
  const tables = Array.from({ length: Math.max(0, count) }, (_, index) => index + 1);
  return (
    <div className={styles.wrapper}>
      {tables.map((number) => (
        <div key={number} className={styles.table}>
          <LayoutGrid size={28} className="text-amber-700" />
          <span className={styles.number}>{number}</span>
        </div>
      ))}
    </div>
  );
};