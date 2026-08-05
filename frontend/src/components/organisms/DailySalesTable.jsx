const styles = {
  wrapper: 'overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[700px] text-left text-sm',
  th: 'bg-slate-100 px-4 py-3 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-4 py-3 align-middle',
  row: 'cursor-pointer hover:bg-slate-50',
  finalizada: 'bg-emerald-50',
  preparacion: 'bg-orange-50',
  badge: 'inline-block rounded px-2 py-1 text-xs font-bold',
  badgeFinalizada: 'bg-emerald-100 text-emerald-700',
  badgePreparacion: 'bg-orange-100 text-orange-700',
  empty: 'p-6 text-center text-sm text-slate-400'
};

const formatHora = (hora) => {
  if (!hora) return '—';
  const [horaStr, minutoStr] = hora.split(':');
  const horaNum = Number(horaStr);
  const periodo = horaNum >= 12 ? 'PM' : 'AM';
  const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
  return `${hora12}:${minutoStr} ${periodo}`;
};

export const DailySalesTable = ({ sales, onSelect }) => {
  if (sales.length === 0) {
    return <p className={styles.empty}>No hay ventas para mostrar</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>N° Venta</th>
            <th className={styles.th}>Hora</th>
            <th className={styles.th}>Mesero (Apertura)</th>
            <th className={styles.th}>Cajero</th>
            <th className={styles.th}>Total</th>
            <th className={styles.th}>Mesa</th>
            <th className={styles.th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr
              key={sale.idVenta}
              className={`${styles.row} ${sale.estado === 'Finalizada' ? styles.finalizada : styles.preparacion}`}
              onClick={() => onSelect(sale)}
            >
              <td className={styles.td}>{sale.numVenta}</td>
              <td className={styles.td}>{formatHora(sale.hora)}</td>
              <td className={styles.td}>{sale.meseroApertura}</td>
              <td className={styles.td}>{sale.cajero}</td>
              <td className={styles.td}>Bs {Number(sale.total).toFixed(2)}</td>
              <td className={styles.td}>{sale.mesa}</td>
              <td className={styles.td}>
                <span className={`${styles.badge} ${sale.estado === 'Finalizada' ? styles.badgeFinalizada : styles.badgePreparacion}`}>
                  {sale.estado}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};