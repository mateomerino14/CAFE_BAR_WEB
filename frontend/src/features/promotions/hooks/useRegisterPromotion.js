import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { usePromotionProductStaging } from '../../../hooks/usePromotionProductStaging';
import { isValidProductName, isValidDecimal } from '../../../utils/validators';
import { createPromotion } from '../services/promotionService';

const INITIAL_VALUES = { nombre: '', precioProm: '' };
const INITIAL_SCHEDULE = {
  scheduleType: 'always',
  fechaEspecifica: '',
  fechaInicio: '',
  fechaFin: '',
  horaInicio: '09:00',
  horaFin: '18:00',
  daysEnabled: false
};

export const useRegisterPromotion = () => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [days, setDays] = useState([]);
  const { file: photo, preview: photoPreview, handleFileChange, reset: resetPhoto } = useFileWithPreview();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const staging = usePromotionProductStaging();
  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));
  const updateField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const updateSchedule = (field, value) => setSchedule((prev) => ({ ...prev, [field]: value }));
  const toggleDay = (day) => setDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));

  const handleAddProduct = (event) => {
    event.preventDefault();
    staging.handleAdd();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!values.nombre.trim() || !values.precioProm) {
      setError('Debe llenar los campos obligatorios');
      return;
    }
    if (!isValidProductName(values.nombre)) {
      setError('El nombre contiene caracteres no permitidos');
      return;
    }
    if (!isValidDecimal(values.precioProm)) {
      setError('El precio debe ser un número válido (máximo 8 dígitos enteros y 2 decimales, sin letras ni negativos)');
      return;
    }
    if (schedule.scheduleType === 'specific' && !schedule.fechaEspecifica) {
      setError('Seleccione la fecha específica de la promoción');
      return;
    }
    if (schedule.scheduleType === 'range' && (!schedule.fechaInicio || !schedule.fechaFin)) {
      setError('Seleccione el rango de fechas de la promoción');
      return;
    }
    if ((schedule.scheduleType === 'recurring' || (schedule.scheduleType === 'range' && schedule.daysEnabled)) && days.length === 0) {
      setError('Seleccione por lo menos un día de la semana');
      return;
    }
    if (staging.items.length === 0) {
      setError('La promoción debe tener por lo menos un producto');
      return;
    }
    const formData = new FormData();
    formData.append('nombre', values.nombre.trim());
    formData.append('precioProm', values.precioProm);
    formData.append('schedule', JSON.stringify(schedule));
    formData.append('days', JSON.stringify(days));
    formData.append('products', JSON.stringify(staging.items.map((item) => ({ idProd: item.id_prod, cantidad: item.cantidad }))));
    if (photo) formData.append('photo', photo);
    setLoading(true);
    try {
      await createPromotion(formData);
      setSuccess('La promoción se registró con éxito');
      setValues(INITIAL_VALUES);
      setSchedule(INITIAL_SCHEDULE);
      setDays([]);
      resetPhoto();
      staging.reset();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la promoción');
    } finally {
      setLoading(false);
    }
  };

  return { values, updateField, schedule, updateSchedule, days, toggleDay, photoPreview, handleFileChange, staging, handleAddProduct, error, success, loading, handleSubmit };
};