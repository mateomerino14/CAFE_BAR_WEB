import { useEffect, useMemo, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { usePermissionsSelection } from '../../../hooks/usePermissionsSelection';
import { getScreensTree, getRoleNames, createRole } from '../services/roleService';

const DEFAULT_ROLE_NAMES = ['Cocinero', 'Mesero', 'Cajero'];

export const useRegisterRole = () => {
  const [name, setName] = useState('');
  const [screens, setScreens] = useState([]);
  const [existingNames, setExistingNames] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { selectedIds, setSelectedIds, toggle, selectAllInScreen, selectNoneInScreen } = usePermissionsSelection([]);
  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));
  useEffect(() => {
    getScreensTree().then(setScreens).catch(() => setScreens([]));
    getRoleNames().then(setExistingNames).catch(() => setExistingNames([]));
  }, []);

  const nameOptions = useMemo(() => {
    return Array.from(new Set([...DEFAULT_ROLE_NAMES, ...existingNames]));
  }, [existingNames]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Ingrese un nombre para el cargo');
      return;
    }
    if (selectedIds.length === 0) {
      setError('Se debe dar acceso por lo menos a una subsección');
      return;
    }
    setLoading(true);
    try {
      await createRole(name.trim(), selectedIds);
      setSuccess('Cargo registrado con éxito');
      setName('');
      setSelectedIds([]);
      getRoleNames().then(setExistingNames).catch(() => {});
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Ya existe un cargo con ese nombre');
      } else {
        setError('No se pudo registrar el cargo');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    screens,
    nameOptions,
    selectedIds,
    toggle,
    selectAllInScreen,
    selectNoneInScreen,
    error,
    success,
    loading,
    handleSubmit
  };
};