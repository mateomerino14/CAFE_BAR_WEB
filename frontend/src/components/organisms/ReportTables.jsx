import { Fragment } from 'react';

const formatHora = (hora) => {
  if (!hora) return '—';
  const [horaStr, minutoStr] = hora.split(':');
  const horaNum = Number(horaStr);
  const periodo = horaNum >= 12 ? 'PM' : 'AM';
  const hora12 = horaNum % 12 === 0 ? 12 : horaNum % 12;
  return `${hora12}:${minutoStr} ${periodo}`;
};

const styles = {
  wrapper: 'mt-4 overflow-x-auto rounded-xl bg-white shadow-sm',
  table: 'w-full min-w-[700px] text-left text-sm',
  th: 'bg-slate-100 px-3 py-2 font-bold text-slate-600',
  td: 'border-t border-slate-100 px-3 py-2',
  empty: 'mt-4 p-6 text-center text-sm text-slate-400',
  footer: 'border-t-2 border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold',
  badgePromo: 'inline-block rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700',
  badgeProducto: 'inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600',
  gananciaPositiva: 'font-bold text-emerald-600',
  gananciaNegativa: 'font-bold text-red-600',
  nombreClickeable: 'font-semibold text-blue-700 underline decoration-dotted hover:text-blue-900'
};

export const DetailedSalesTable = ({ rows, onSelect }) => {
  if (rows.length === 0) return <p className={styles.empty}>No hay ventas en este período</p>;
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {['N° Venta', 'Fecha', 'Hora', 'Mesero', 'Cajero', 'Salón', 'Mesa', 'Total', 'Efectivo', 'QR', 'Estado'].map((h) => <th key={h} className={styles.th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.idVenta} className="cursor-pointer hover:bg-slate-50" onClick={() => onSelect(r)}>
              <td className={styles.td}>{r.numVenta}</td>
              <td className={styles.td}>{r.fecha.slice(0, 10)}</td>
              <td className={styles.td}>{formatHora(r.hora)}</td>
              <td className={styles.td}>{r.meseroApertura}</td>
              <td className={styles.td}>{r.cajero}</td>
              <td className={styles.td}>{r.salon}</td>
              <td className={styles.td}>{r.mesa}</td>
              <td className={styles.td}>Bs {r.total.toFixed(2)}</td>
              <td className={styles.td}>Bs {r.efectivo.toFixed(2)}</td>
              <td className={styles.td}>Bs {r.qr.toFixed(2)}</td>
              <td className={styles.td}>{r.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const SummaryByDateTable = ({ result }) => {
  if (result.rows.length === 0) return <p className={styles.empty}>No hay ventas en este período</p>;
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>{['Fecha', 'Cajero', 'N° Ventas', 'Total Monto', 'Efectivo', 'QR'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {result.rows.map((r, index) => (
            <tr key={index}>
              <td className={styles.td}>{r.fecha}</td>
              <td className={styles.td}>{r.cajero}</td>
              <td className={styles.td}>{r.totalVentas}</td>
              <td className={styles.td}>Bs {r.totalMonto.toFixed(2)}</td>
              <td className={styles.td}>Bs {r.efectivo.toFixed(2)}</td>
              <td className={styles.td}>Bs {r.qr.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td colSpan={6} className={styles.footer}>Total general del período: Bs {result.granTotal.toFixed(2)}</td></tr>
        </tfoot>
      </table>
    </div>
  );
};

export const TopProductsTable = ({ rows, onSelectPromo }) => {
  if (rows.length === 0) return <p className={styles.empty}>No hay productos ni promociones vendidas en este período</p>;
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>{['Tipo', 'Nombre', 'Cantidad', 'Ingreso', 'Costo', 'Ganancia'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={index}>
              <td className={styles.td}>
                <span className={r.tipo === 'promocion' ? styles.badgePromo : styles.badgeProducto}>
                  {r.tipo === 'promocion' ? 'Promoción' : 'Producto'}
                </span>
              </td>
              <td className={styles.td}>
                {r.tipo === 'promocion' ? (
                  <button type="button" className={styles.nombreClickeable} onClick={() => onSelectPromo(r)}>
                    {r.nombre}
                  </button>
                ) : (
                  r.nombre
                )}
              </td>
              <td className={styles.td}>{r.cantidad}</td>
              <td className={styles.td}>Bs {r.ingreso.toFixed(2)}</td>
              <td className={styles.td}>Bs {r.costo.toFixed(2)}</td>
              <td className={`${styles.td} ${r.ganancia >= 0 ? styles.gananciaPositiva : styles.gananciaNegativa}`}>Bs {r.ganancia.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const EmployeeSalesTable = ({ rows }) => {
  if (rows.length === 0) return <p className={styles.empty}>No hay ventas de este empleado en este período</p>;
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>{['N° Venta', 'Fecha', 'Hora', 'Rol', 'Total'].map((h) => <th key={h} className={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={index}>
              <td className={styles.td}>{r.numVenta}</td>
              <td className={styles.td}>{r.fecha.slice(0, 10)}</td>
              <td className={styles.td}>{formatHora(r.hora)}</td>
              <td className={styles.td}>{r.rol}</td>
              <td className={styles.td}>Bs {r.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};