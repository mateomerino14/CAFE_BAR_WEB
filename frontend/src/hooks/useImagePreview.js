import {useState} from 'react';

export const useImagePreview = (initialSrc) => {
  const [src, setSrc] = useState(initialSrc);
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSrc(URL.createObjectURL(file));
  };
  return {src, handleFileChange};
};