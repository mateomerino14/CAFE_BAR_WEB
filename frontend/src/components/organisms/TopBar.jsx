import { LogOut } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, typography } from '../../constants/theme';

const styles = {
  wrapper: 'flex flex-col gap-1 border-b border-slate-200 bg-white px-4 py-2 sm:px-6',
  topRow: 'flex items-center justify-between gap-2',
  user: `text-xs sm:text-sm font-bold ${colors.textPrimary}`,
  title: `${typography.title} text-center text-xl sm:text-xl md:text-2xl ${colors.textPrimary} mt-1`,
  buttonContent: 'flex items-center gap-1.5'
};

export const TopBar = ({ title }) => {
  const { session, logout } = useAuth();

  return (
    <header className={styles.wrapper}>
      <div className={styles.topRow}>
        <span className={styles.user}>Usuario: {session?.alias}</span>
        <Button variant="warning" size="sm" onClick={logout}>
          <span className={styles.buttonContent}><LogOut size={14} /> CERRAR SESIÓN</span>
        </Button>
      </div>
      <h1 className={styles.title}>{title}</h1>
    </header>
  );
};