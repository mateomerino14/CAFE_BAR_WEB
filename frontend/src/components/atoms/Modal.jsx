import {useEffect} from 'react';

const styles = {
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4',
  wrapper: 'relative w-full max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl',
  sm: 'max-w-sm',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl'
};

export const Modal = ({children, onClose, size = 'sm'}) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  const sizeClass = styles[size] || styles.sm;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.wrapper} ${sizeClass}`} onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};