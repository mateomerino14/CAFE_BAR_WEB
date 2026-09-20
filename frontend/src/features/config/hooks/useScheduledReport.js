import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getScheduledReportConfig, updateScheduledReportConfig } from '../services/configService';

export const useScheduledReport = () => {
  const [email, setEmail] = useState('');
  const [diaSemana, setDiaSemana] = useState('');
  const [hora, setHora] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  return { email, setEmail, diaSemana, setDiaSemana, hora, setHora, loading, saving, handleSave, error, success };
};
