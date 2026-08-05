const styles = {
  base: 'fixed inset-0 z-40 bg-black/50'
};

export const Overlay = ({ onClick, className = '' }) => {
  return <div className={`${styles.base} ${className}`} onClick={onClick} />;
};