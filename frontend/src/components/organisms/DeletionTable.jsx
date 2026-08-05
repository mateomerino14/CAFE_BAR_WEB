const styles = {
  wrapper: 'max-h-96 overflow-auto rounded-lg border border-slate-200',
  table: 'w-full min-w-[500px] text-left text-sm',
  th: 'sticky top-0 bg-slate-100 px-3 py-2 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-3 py-2 align-middle',
  rowWarning: 'bg-red-50',
  empty: 'p-4 text-center text-sm text-slate-400'
};

export const DeletionTable = ({ columns, rows, getId, isSelected, onToggle, hasWarning }) => {
  if (rows.length === 0) {
    return <p className={styles.empty}>No hay registros</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}></th>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getId(row);
            const warning = hasWarning ? hasWarning(row) : false;
            return (
              <tr key={id} className={warning ? styles.rowWarning : ''}>
                <td className={styles.td}>
                  <input type="checkbox" checked={isSelected(id)} onChange={() => onToggle(id)} />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};