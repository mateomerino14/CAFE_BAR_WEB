import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { useFileWithPreview } from '../../../hooks/useFileWithPreview';
import { usePromotionProductStaging } from '../../../hooks/usePromotionProductStaging';
import { isValidProductName, isValidDecimal } from '../../../utils/validators';
import { getPromotion, updatePromotion } from '../services/promotionService';

const determineScheduleType = (promotion, days) => {
  if (promotion.fecha_especifica) return 'specific';
  if (promotion.fecha_inicio || promotion.fecha_fin) return 'range';
  if (days.length > 0) return 'recurring';
  return 'always';
};

export const useEditPromotion = (promotionSummary, onSaved) => {
  const [values, setValues] = useState({ nombre: '', precioProm: '' });
  const [schedule, setSchedule] = useState({
    scheduleType: 'always', fechaEspecifica: '', fechaInicio: '', fechaFin: '', horaInicio: '09:00', horaFin: '18:00', daysEnabled: false
  });
  const [days, setDays] = useState([]);
  const { preview, handleFileChange, file, setPreview } = useFileWithPreview();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const staging = usePromotionProductStaging();
  useAutoDismiss(error, () => setError(''));
  useEffect(() => {
    getPromotion(promotionSummary.id_prom).then(({ promotion, days: fetchedDays, products }) => {
      setValues({ nombre: promotion.nom_prom, precioProm: String(promotion.precio_prom) });
      setPreview(promotion.img_prom);
      const scheduleType = determineScheduleType(promotion, fetchedDays);
      setSchedule({
        scheduleType,
        fechaEspecifica: promotion.fecha_especifica || '',
        fechaInicio: promotion.fecha_inicio || '',
        fechaFin: promotion.fecha_fin || '',
        horaInicio: promotion.hora_inicio || '09:00',
        horaFin: promotion.hora_fin || '18:00',
        daysEnabled: scheduleType === 'range' && fetchedDays.length > 0
      });
      setDays(fetchedDays);
      staging.setItems(
        products.map((item) => ({
          id_prod: item.id_prod,
          nom_prod: item.producto?.nom_prod,
          precio_venta: item.producto?.precio_venta,
          cantidad: String(item.cantidad_prod_prom)
        }))
      );
      setReady(true);
    });
  }, [promotionSummary]);
  const updateField = (field, value) => setValues((prev) => ({ ...prev, [field]: value }));
  const updateSchedule = (field, value) => setSchedule((prev) => ({ ...prev, [field]: value }));
  const toggleDay = (day) => setDays((prev) => (prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]));
  const handleAddProduct = (event) => {
    event.preventDefault();
    staging.handleAdd();
  };

  const handleSave = async (event) => {
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
    if (file) formData.append('photo', file);
    setLoading(true);
    try {
      await updatePromotion(promotionSummary.id_prom, formData);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo modificar la promoción');
    } finally {
      setLoading(false);
    }
  };
  return { values, updateField, schedule, updateSchedule, days, toggleDay, preview, handleFileChange, staging, handleAddProduct, ready, error, loading, handleSave };
};