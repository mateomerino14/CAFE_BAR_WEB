import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getRoles, getRoleNames } from '../services/roleService';

export const useRolesList = () => {
  const [search, setSearch] = useState('');
  const [roles, setRoles] = useState([]);
  const [names, setNames] = useState([]);
  const [editingRole, setEditingRole] = useState(null);
  const [success, setSuccess] = useState('');

  useAutoDismiss(success, () => setSuccess(''));

  const fetchRoles = async (term) => {
    const data = await getRoles(term);
    setRoles(data);
  };

  useEffect(() => {
    fetchRoles('');
    getRoleNames().then(setNames).catch(() => setNames([]));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchRoles(search.trim());
  };

  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchRoles(name);
  };

  const openEdit = (role) => setEditingRole(role);
  const closeEdit = () => setEditingRole(null);

  const refresh = () => {
    fetchRoles(search.trim());
    getRoleNames().then(setNames).catch(() => {});
  };

  const handleSaved = () => {
    setSuccess('Se ha registrado con éxito la modificación');
    closeEdit();
    refresh();
  };

  return {
    search,
    setSearch,
    roles,
    names,
    handleSearch,
    handleSelectSuggestion,
    editingRole,
    openEdit,
    closeEdit,
    success,
    handleSaved
  };
};