import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { resetEmployeePassword } from '../services/employeeService';

export const useResetPassword = (codEmp, onDone) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await resetEmployeePassword(codEmp, newPassword);
      setSuccess('Contraseña restablecida con éxito');
      setNewPassword('');
      setConfirmPassword('');
      onDone();
    } catch (err) {
      setError('No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return { newPassword, setNewPassword, confirmPassword, setConfirmPassword, error, success, loading, handleSubmit };
};