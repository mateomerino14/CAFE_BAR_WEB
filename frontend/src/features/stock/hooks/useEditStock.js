import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { isLettersOnly, isValidDecimal } from '../../../utils/validators';
import { getStockItem, updateStockItem } from '../services/stockService';

export const useEditStock = (itemSummary, onSaved) => {
  const [values, setValues] = useState({
    nombre: '',
    unidadMedida: '',
    cantidadStock: '',
    precioExtra: '',
    descripcion: ''
  });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useAutoDismiss(error, () => setError(''));
  useEffect(() => {
    getStockItem(itemSummary.id_ing).then((item) => {
      setValues({
        nombre: item.nom_ing,
        unidadMedida: item.unidad_medida,
        cantidadStock: String(item.cantidad_stock),
        precioExtra: String(item.precio_extra || ''),
        descripcion: item.descripcion || ''
      });
      setReady(true);
    });
  }, [itemSummary]);
  const updateField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const handleSave = async (event) => {
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
      await updateStockItem(itemSummary.id_ing, values);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo modificar el ingrediente');
    } finally {
      setLoading(false);
    }
  };
  return { values, updateField, ready, error, loading, handleSave };
};