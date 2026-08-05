import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { isLettersOnly } from '../../../utils/validators';
import { getSectionTableCount, updateSection } from '../services/sectionService';

export const useManageSection = (section, onUpdated) => {
  const [nombre, setNombre] = useState(section.nomb_seccion);
  const [descripcion, setDescripcion] = useState(section.descripcion || '');
  const [cantidadMesas, setCantidadMesas] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));
  useEffect(() => {
    getSectionTableCount(section.id_seccion).then((count) => {
      setCantidadMesas(String(count));
      setReady(true);
    });
  }, [section]);

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
      await updateSection(section.id_seccion, { nombre: nombre.trim(), descripcion: descripcion.trim(), cantidadMesas: Number(cantidadMesas) });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo modificar la sección');
    } finally {
      setLoading(false);
    }
  };
  return { nombre, setNombre, descripcion, setDescripcion, cantidadMesas, setCantidadMesas, ready, error, loading, handleSubmit };
};