const styles = {
  wrapper: 'grid grid-cols-2 gap-3',
  card: 'flex flex-col items-center gap-1 rounded-xl p-4 text-center text-white shadow-sm',
  finalizadas: 'bg-emerald-500',
  preparacion: 'bg-orange-400',
  count: 'text-2xl font-bold',
  label: 'text-xs font-bold uppercase tracking-wide',
  monto: 'mt-1 rounded-lg bg-black/20 px-3 py-1 text-xs font-bold'
};

export const DailySalesSummaryCards = ({summary}) => {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} ${styles.finalizadas}`}>
        <span className={styles.count}>{summary.finalizadas}</span>
        <span className={styles.label}>Finalizadas</span>
        <span className={styles.monto}>Total: Bs {Number(summary.montoFinalizado).toFixed(2)}</span>
      </div>
      <div className={`${styles.card} ${styles.preparacion}`}>
        <span className={styles.count}>{summary.enPreparacion}</span>
        <span className={styles.label}>En Preparación</span>
      </div>
    </div>
  );
};