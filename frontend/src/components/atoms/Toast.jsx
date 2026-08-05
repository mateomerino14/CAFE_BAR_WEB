import { AlertCircle, CheckCircle2 } from 'lucide-react';

const styles = {
  base: 'fixed right-4 top-4 z-50 flex max-w-xs items-center gap-2 rounded-md px-4 py-2.5 shadow-lg animate-fade-in-down',
  error: 'bg-red-50 text-red-600',
  success: 'bg-green-50 text-green-600',
  text: 'text-sm font-medium'
};

export const Toast = ({ children, variant = 'error' }) => {
  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div className={`${styles.base} ${styles[variant]}`}>
      <Icon size={16} className="shrink-0" />
      <span className={styles.text}>{children}</span>
    </div>
  );
};