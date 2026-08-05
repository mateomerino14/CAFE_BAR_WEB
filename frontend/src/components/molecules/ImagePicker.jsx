import { Camera } from 'lucide-react';
import { ImageBox } from '../atoms/ImageBox';

const styles = {
  wrapper: 'group relative h-40 w-40 cursor-pointer',
  overlay: 'absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 text-transparent transition-all duration-200 group-hover:bg-black/40 group-hover:text-white',
  input: 'hidden'
};

export const ImagePicker = ({ src, alt, onFileChange }) => {
  return (
    <label className={styles.wrapper}>
      <ImageBox src={src} alt={alt} />
      <span className={styles.overlay}>
        <Camera size={28} />
      </span>
      <input type="file" accept="image/*" className={styles.input} onChange={onFileChange} />
    </label>
  );
};