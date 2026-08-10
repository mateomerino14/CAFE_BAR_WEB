import {useState} from 'react';

export const usePermissionsSelection = (initialIds = []) => {
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const toggle = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };
  const selectAllInScreen = (ids) => {
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };
  const selectNoneInScreen = (ids) => {
    setSelectedIds((prev) => prev.filter((item) => !ids.includes(item)));
  };
  return { selectedIds, setSelectedIds, toggle, selectAllInScreen, selectNoneInScreen };
};