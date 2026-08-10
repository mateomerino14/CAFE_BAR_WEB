import {useEffect, useState} from 'react';

export const useMouseTilt = (maxDegrees = 12) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setTilt({ x: x * maxDegrees, y: -y * maxDegrees });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [maxDegrees]);
  return tilt;
};