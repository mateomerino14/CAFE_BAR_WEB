const styles = {
  base: 'aspect-square w-full overflow-hidden rounded-lg bg-gray-200 transition-transform hover:scale-105',
  placeholder: 'flex h-full w-full items-center justify-center text-gray-400'
};

export const Avatar = ({src, alt, onClick, className = ''}) => {
  return (
    <button type="button" onClick={onClick} className={`${styles.base} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover"/>
      ) : (
        <div className={styles.placeholder}>?</div>
      )}
    </button>
  );
};