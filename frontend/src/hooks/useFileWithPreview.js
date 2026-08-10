import {useState} from 'react';

export const useFileWithPreview = (initialSrc = null) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialSrc);
  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };
  const reset = () => {
    setFile(null);
    setPreview(initialSrc);
  };
  return {file, preview, handleFileChange, reset, setPreview};
};