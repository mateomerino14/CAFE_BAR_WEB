import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { useAuth } from '../../context/AuthContext';

const styles = {
  overlay: 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4',
  wrapper: 'w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl',
  header: 'mb-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-700 px-4 py-3 text-center shadow-sm',
  eyebrow: 'text-xs font-semibold uppercase tracking-wide text-orange-100',
  title: 'text-lg font-bold text-white',
  body: 'text-center text-sm text-slate-600',
  actions: 'mt-4 flex flex-col gap-2'
};

export const SessionExpiredModal = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  const handleAccept = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Sesión expirada</p>
          <h2 className={styles.title}>Tu sesión ha vencido</h2>
        </div>
        <p className={styles.body}>
          Por seguridad, tu sesión se cerró automáticamente después de un tiempo de inactividad. Vuelve a iniciar sesión para continuar.
        </p>
        <div className={styles.actions}>
          <Button type="button" onClick={handleAccept}>INICIAR SESIÓN DE NUEVO</Button>
        </div>
      </div>
    </div>
  );
};