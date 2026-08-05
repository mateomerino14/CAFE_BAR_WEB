import { useEffect } from 'react';

export const useAutoDismiss = (value, onDismiss, delay = 1500) => {
  useEffect(() => {
    if (!value) return undefined;

    const timeout = setTimeout(() => onDismiss(), delay);
    return () => clearTimeout(timeout);
  }, [value, onDismiss, delay]);
};