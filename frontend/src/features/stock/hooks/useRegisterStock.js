import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { isLettersOnly, isValidDecimal } from '../../../utils/validators';
import { createStockItem, getStockNames } from '../services/stockService';

const INITIAL_VALUES = {
  nombre: '',
  unidadMedida: '',
  cantidadStock: '',
  precioExtra: '',
  descripcion: ''
};

export const useRegisterStock = () => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [existingNames, setExistingNames] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));
  useEffect(() => {
    getStockNames().then(setExistingNames).catch(() => setExistingNames([]));
  }, []);
  const updateField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const isDuplicateName = values.nombre.trim() !== '' &&
    existingNames.some((name) => name.toLowerCase() === values.nombre.trim().toLowerCase());
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.nombre.trim() || !values.unidadMedida || !values.cantidadStock) {
      setError('Llene los campos obligatorios porfavor');
      return;
    }
    if (!isLettersOnly(values.nombre)) {
      setError('El nombre solo debe contener letras');
      return;
    }
    if (!isValidDecimal(values.cantidadStock)) {
      setError('La cantidad de stock debe ser un número válido (máximo 8 dígitos enteros y 2 decimales, sin letras ni negativos)');
      return;
    }
    if (values.precioExtra && !isValidDecimal(values.precioExtra)) {
      setError('El precio extra debe ser un número válido (máximo 8 dígitos enteros y 2 decimales, sin letras ni negativos)');
      return;
    }
    setLoading(true);
    try {
      await createStockItem(values);
      setSuccess('Se ha registrado con éxito');
      setValues(INITIAL_VALUES);
      getStockNames().then(setExistingNames).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el ingrediente');
    } finally {
      setLoading(false);
    }
  };

  return { values, updateField, isDuplicateName, error, success, loading, handleSubmit };
};