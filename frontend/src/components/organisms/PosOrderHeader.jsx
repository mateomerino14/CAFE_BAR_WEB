import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const styles = {
  wrapper: 'grid grid-cols-2 gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-6',
  field: 'flex flex-col items-center gap-1 text-center',
  label: 'text-xs font-bold uppercase text-slate-500',
  value: 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-800'
};

const formatTime = (date) => date.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

export const PosOrderHeader = ({ seccion, mesa, mesero, numVenta }) => {
  const { session } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.field}>
        <span className={styles.label}>N° Venta</span>
        <span className={styles.value}>{numVenta || '—'}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Sección</span>
        <span className={styles.value}>{seccion?.nomb_seccion || '—'}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Mesa</span>
        <span className={styles.value}>{mesa?.id_mesa || '—'}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Apertura Mesero</span>
        <span className={styles.value}>{mesero?.alias_emp || '—'}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Cajero</span>
        <span className={styles.value}>{session?.alias}</span>
      </div>
      <div className={styles.field}>
        <span className={styles.label}>Hora</span>
        <span className={styles.value}>{formatTime(now)}</span>
      </div>
    </div>
  );
};