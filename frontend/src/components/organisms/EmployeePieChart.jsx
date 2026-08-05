import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#2980b9', '#27ae60', '#f39c12', '#9b59b6', '#e74c3c', '#16a085', '#d35400', '#2c3e50', '#c0392b', '#8e44ad'];

const styles = {
  wrapper: 'rounded-xl bg-white p-4 shadow-sm',
  title: 'text-center text-sm font-bold text-slate-700',
  chart: 'mt-2',
  empty: 'p-6 text-center text-sm text-slate-400'
};

export const EmployeePieChart = ({ rows, titulo }) => {
  if (rows.length === 0) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.title}>{titulo}</p>
        <p className={styles.empty}>No hay datos en este período</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{titulo}</p>
      <div className={styles.chart} style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="totalVentas"
              nameKey="empleado"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={(entry) => `${entry.empleado}: ${entry.totalVentas}`}
            >
              {rows.map((entry, index) => (
                <Cell key={entry.empleado} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};