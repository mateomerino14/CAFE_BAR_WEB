const styles = {
  base: 'h-20 w-20 sm:h-38 sm:w-38 overflow-hidden rounded-full border-4 border-white shadow-md'
};

export const Logo = ({ src, alt }) => {
  return (
    <div className={styles.base}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
};