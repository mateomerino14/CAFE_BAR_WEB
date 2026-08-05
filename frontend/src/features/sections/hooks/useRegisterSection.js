import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { isLettersOnly } from '../../../utils/validators';
import { createSection } from '../services/sectionService';

export const useRegisterSection = (onRegistered) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [cantidadMesas, setCantidadMesas] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!nombre.trim() || cantidadMesas === '') {
      setError('Rellene los campos solicitados');
      return;
    }
    if (!isLettersOnly(nombre)) {
      setError('El nombre de la sección solo debe contener letras');
      return;
    }
    if (Number(cantidadMesas) < 0) {
      setError('La cantidad debe ser un número mayor o igual a 0');
      return;
    }
    setLoading(true);
    try {
      await createSection({ nombre: nombre.trim(), descripcion: descripcion.trim(), cantidadMesas: Number(cantidadMesas) });
      setNombre('');
      setDescripcion('');
      setCantidadMesas('');
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la sección');
    } finally {
      setLoading(false);
    }
  };
  return { nombre, setNombre, descripcion, setDescripcion, cantidadMesas, setCantidadMesas, error, loading, handleSubmit };
};