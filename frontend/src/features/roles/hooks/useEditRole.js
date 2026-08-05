import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { usePermissionsSelection } from '../../../hooks/usePermissionsSelection';
import { getScreensTree, getRolePermissions, updateRolePermissions } from '../services/roleService';

export const useEditRole = (role, onSaved) => {
  const [screens, setScreens] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const { selectedIds, setSelectedIds, toggle, selectAllInScreen, selectNoneInScreen } = usePermissionsSelection([]);
  useAutoDismiss(error, () => setError(''));
  useEffect(() => {
    Promise.all([getScreensTree(), getRolePermissions(role.id_cargo)]).then(([screensData, ids]) => {
      setScreens(screensData);
      setSelectedIds(ids);
      setReady(true);
    });
  }, [role]);

  const handleSave = async () => {
    setError('');
    if (selectedIds.length === 0) {
      setError('Se debe dar acceso por lo menos a una subsección');
      return;
    }
    setLoading(true);
    try {
      await updateRolePermissions(role.id_cargo, selectedIds);
      onSaved();
    } catch (err) {
      setError('No se pudo modificar el cargo');
    } finally {
      setLoading(false);
    }
  };

  return { screens, selectedIds, toggle, selectAllInScreen, selectNoneInScreen, error, loading, ready, handleSave };
};