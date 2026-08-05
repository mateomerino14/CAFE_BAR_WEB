import { UserRound } from 'lucide-react';

const styles = {
  wrapper: 'flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-slate-100 animate-glow-pulse',
  image: 'h-full w-full rounded-full object-cover',
  placeholder: 'text-slate-300'
};

export const CoverImage = ({ src, alt }) => {
  return (
    <div className={styles.wrapper}>
      {src ? (
        <img src={src} alt={alt} className={styles.image} />
      ) : (
        <UserRound size={64} className={styles.placeholder} />
      )}
    </div>
  );
};