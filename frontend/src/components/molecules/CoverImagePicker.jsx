import { Camera } from 'lucide-react';
import { CoverImage } from '../atoms/CoverImage';

const styles = {
  wrapper: 'group relative h-48 w-48 cursor-pointer sm:h-64 sm:w-64 md:h-72 md:w-72',
  overlay: 'absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-all duration-200 group-hover:bg-black/40 group-hover:text-white',
  input: 'hidden'
};

export const CoverImagePicker = ({ src, alt, onFileChange }) => {
  return (
    <label className={styles.wrapper}>
      <CoverImage src={src} alt={alt} />
      <span className={styles.overlay}>
        <Camera size={36} />
      </span>
      <input type="file" accept="image/*" className={styles.input} onChange={onFileChange} />
    </label>
  );
};