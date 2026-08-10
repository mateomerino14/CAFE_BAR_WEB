import {AlertCircle} from 'lucide-react';

const styles = {
  wrapper: 'flex w-full items-center justify-start gap-1.5 rounded-md bg-red-50 px-2.5 py-1.5 text-left',
  text: 'text-xs font-medium text-red-600'
};

export const ErrorMessage = ({children}) => {
  return (
    <div className={styles.wrapper}>
      <AlertCircle size={14} className="shrink-0 text-red-500" />
      <span className={styles.text}>{children}</span>
    </div>
  );
};