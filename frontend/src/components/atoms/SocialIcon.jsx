
const styles = {
  base: 'flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-200 hover:scale-110 hover:bg-white/25'
};

export const SocialIcon = ({href, label, children}) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={styles.base}>
      {children}
    </a>
  );
};