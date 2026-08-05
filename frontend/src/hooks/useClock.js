import { useEffect, useState } from 'react';

const formatDate = (date) => {
  const formatter = new Intl.DateTimeFormat('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
  const text = formatter.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const formatTime = (date) => {
  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
};

export const useClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return { date: formatDate(now), time: formatTime(now) };
};