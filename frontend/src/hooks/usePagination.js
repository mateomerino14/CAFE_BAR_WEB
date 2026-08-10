import {useEffect, useState} from 'react';

export const usePagination = (items, pageSize) => {
  const [start, setStart] = useState(0);
  useEffect(() => {
    setStart(0);
  }, [items]);
  const visible = items.slice(start, start + pageSize);
  const canGoLeft = start > 0;
  const canGoRight = start + pageSize < items.length;
  const currentPage = Math.floor(start / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const goLeft = () => setStart((prev) => Math.max(0, prev - pageSize));
  const goRight = () => {
    if (!canGoRight) return;
    setStart((prev) => prev + pageSize);
  };
  return { visible, goLeft, goRight, canGoLeft, canGoRight, currentPage, totalPages };
};