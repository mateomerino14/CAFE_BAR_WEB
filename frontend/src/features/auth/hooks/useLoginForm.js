import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { loginRequest, getDirectorioAlias, getEmployeesForLogin } from '../services/authService';

export const useLoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useAutoDismiss(error, () => setError(''));

  useEffect(() => {
    getEmployeesForLogin()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Rellene los campos solicitados');
      return;
    }

    try {
      const data = await loginRequest(username, password);
      login(data);
      navigate('/');
    } catch (err) {
      setError('Credenciales Incorrectas');
    }
  };

  const handleDirectorioMode = async () => {
    try {
      const alias = await getDirectorioAlias();
      if (alias) setUsername(alias);
    } catch (err) {
      setError('No se encontraron datos de directorio');
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    employees,
    error,
    handleSubmit,
    handleDirectorioMode
  };
};