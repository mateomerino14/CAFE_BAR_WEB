
const styles = {
  base: 'flex shrink-0 items-center justify-center bg-transparent text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-30'
};

export const IconButton = ({icon: Icon, size = 22, className = '', ...props}) => {
  return (
    <button type="button" className={`${styles.base} ${className}`} {...props}>
      <Icon size={size} />
    </button>
  );
};