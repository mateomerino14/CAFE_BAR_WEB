import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { changeDirectorioPassword } from '../services/configService';

export const useChangeDirectorioPassword = (onSaved) => {
  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetir, setRepetir] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useAutoDismiss(error, () => setError(''));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!actual || !nueva || !repetir) {
      setError('Rellene los campos solicitados');
      return;
    }

    if (nueva.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    if (nueva === actual) {
      setError('La nueva contraseña debe ser diferente a la actual');
      return;
    }

    if (nueva !== repetir) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      await changeDirectorioPassword(actual, nueva);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return { actual, setActual, nueva, setNueva, repetir, setRepetir, error, loading, handleSubmit };
};