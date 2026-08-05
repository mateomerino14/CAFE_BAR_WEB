import { ImageIcon } from 'lucide-react';

const styles = {
  wrapper: 'flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50',
  image: 'h-full w-full object-cover',
  placeholder: 'text-slate-300'
};

export const ImageBox = ({ src, alt, className = 'h-40 w-40' }) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      {src ? <img src={src} alt={alt} className={styles.image} /> : <ImageIcon size={32} className={styles.placeholder} />}
    </div>
  );
};