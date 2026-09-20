import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getSystemConfig, updateSystemConfig } from '../services/systemConfigService';

export const useSystemConfig = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [brevoApiKey, setBrevoApiKey] = useState('');
  const [brevoSenderEmail, setBrevoSenderEmail] = useState('');
  const [brevoSenderName, setBrevoSenderName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  useEffect(() => {
    getSystemConfig()
      .then((config) => {
        setHasApiKey(config.hasApiKey);
        setBrevoSenderEmail(config.brevoSenderEmail || '');
        setBrevoSenderName(config.brevoSenderName || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError('');
    if (!brevoApiKey.trim() || !brevoSenderEmail.trim()) {
      setError('Complete la API Key y el correo remitente');
      return;
    }
    setSaving(true);
    try {
      await updateSystemConfig(brevoApiKey.trim(), brevoSenderEmail.trim(), brevoSenderName.trim());
      setHasApiKey(true);
      setSuccess('Configuración de correo guardada correctamente');
    } catch (err) {
      setError('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  return {
    hasApiKey, brevoApiKey, setBrevoApiKey, brevoSenderEmail, setBrevoSenderEmail, brevoSenderName, setBrevoSenderName,
    loading, saving, handleSave, error, success
  };
};
