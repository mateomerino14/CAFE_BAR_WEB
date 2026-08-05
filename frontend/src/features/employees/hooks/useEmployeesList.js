import { useEffect, useState } from 'react';
import { getEmployees, getEmployeeNames } from '../services/employeeService';

export const useEmployeesList = () => {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [names, setNames] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const fetchEmployees = async (term) => {
    const data = await getEmployees(term);
    setEmployees(data);
  };
  useEffect(() => {
    fetchEmployees('');
    getEmployeeNames().then(setNames).catch(() => setNames([]));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchEmployees(search.trim());
  };

  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchEmployees(name);
  };

  const openEdit = (employee) => setEditingEmployee(employee);
  const closeEdit = () => setEditingEmployee(null);

  const refresh = () => {
    fetchEmployees(search.trim());
    getEmployeeNames().then(setNames).catch(() => {});
  };

  return { search, setSearch, employees, names, handleSearch, handleSelectSuggestion, editingEmployee, openEdit, closeEdit, refresh };
};