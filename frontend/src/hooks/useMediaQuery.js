import {useEffect, useState} from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);
    mediaQueryList.addEventListener('change', handleChange);
    setMatches(mediaQueryList.matches);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);
  return matches;
};