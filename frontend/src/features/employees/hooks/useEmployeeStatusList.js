import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getAllEmployeesStatus, getAllEmployeeNames, setEmployeeAvailability } from '../services/employeeService';

export const useEmployeeStatusList = () => {
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState([]);
  const [names, setNames] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  useAutoDismiss(success, () => setSuccess(''));
  useAutoDismiss(error, () => setError(''));

  const fetchEmployees = async (term) => {
    const data = await getAllEmployeesStatus(term);
    setEmployees(data);
  };
  useEffect(() => {
    fetchEmployees('');
    getAllEmployeeNames().then(setNames).catch(() => setNames([]));
  }, []);
  const handleSearch = (event) => {
    event.preventDefault();
    fetchEmployees(search.trim());
  };
  const handleSelectSuggestion = (name) => {
    setSearch(name);
    fetchEmployees(name);
  };
  const handleToggle = async (employee) => {
    try {
      await setEmployeeAvailability(employee.cod_emp, !employee.disponible_emp);
      setSuccess(employee.disponible_emp ? 'Empleado deshabilitado' : 'Empleado habilitado');
      fetchEmployees(search.trim());
      getAllEmployeeNames().then(setNames).catch(() => {});
    } catch (err) {
      setError('No se pudo actualizar el estado del empleado');
    }
  };

  return { search, setSearch, employees, names, handleSearch, handleSelectSuggestion, handleToggle, success, error };
};