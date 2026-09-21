import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getScheduledReportConfig, updateScheduledReportConfig, sendScheduledReportTest } from '../services/configService';

export const useScheduledReport = () => {
  const [email, setEmail] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  useEffect(() => {
    getScheduledReportConfig()
      .then((config) => {
        setEmail(config.email || '');
        setDiaSemana(config.dia_semana !== null && config.dia_semana !== undefined ? String(config.dia_semana) : '');
        setHora(config.hora ? config.hora.slice(0, 5) : '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError('');
    if (!email.trim() || diaSemana === '' || !hora) {
      setError('Complete el correo, el día y la hora');
      return;
    }
    setSaving(true);
    try {
      await updateScheduledReportConfig(email.trim(), Number(diaSemana), hora);
      setSuccess('Configuración guardada correctamente');
    } catch (err) {
      setError('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setError('');
    if (!email.trim()) {
      setError('Primero guarda un correo de destino');
      return;
    }
    setTesting(true);
    try {
      await sendScheduledReportTest();
      setSuccess('Reporte de prueba enviado — revisa la bandeja de entrada');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar el reporte de prueba');
    } finally {
      setTesting(false);
    }
  };

  return { email, setEmail, diaSemana, setDiaSemana, hora, setHora, loading, saving, testing, handleSave, handleTest, error, success };
};
