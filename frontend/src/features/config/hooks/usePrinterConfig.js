import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getPrintAgentUrl, updatePrintAgentUrl } from '../services/configService';
import { checkPrintAgentHealth, getPrinters, getPrinterAssignment, savePrinterAssignment } from '../services/printAgentService';

export const usePrinterConfig = () => {
  const [url, setUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [printers, setPrinters] = useState([]);
  const [ticketPrinter, setTicketPrinter] = useState('');
  const [cocinaPrinter, setCocinaPrinter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  const buildFullUrl = (ipOnly) => `https://${ipOnly.trim()}:4443`;
  const extractIpOnly = (fullUrl) => (fullUrl || '').replace('https://', '').replace(':4443', '');

  useEffect(() => {
    getPrintAgentUrl()
      .then(async (savedValue) => {
        setUrl(extractIpOnly(savedValue));
        setSavedUrl(savedValue);

        if (savedValue) {
          try {
            await checkPrintAgentHealth(savedValue);
            const [printerList, assignment] = await Promise.all([
              getPrinters(savedValue),
              getPrinterAssignment(savedValue)
            ]);
            setPrinters(printerList);
            setTicketPrinter(assignment.ticketPrinter || '');
            setCocinaPrinter(assignment.cocinaPrinter || '');
            setConnectionStatus('connected');
          } catch {
            setConnectionStatus('failed');
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveUrl = async () => {
    setError('');
    if (!url.trim()) {
      setError('Ingrese la dirección IP');
      return;
    }
    const fullUrl = buildFullUrl(url);
    try {
      await updatePrintAgentUrl(fullUrl);
      setSavedUrl(fullUrl);
      setSuccess('Dirección guardada correctamente');
    } catch (err) {
      setError('No se pudo guardar la dirección');
    }
  };

  const handleTestConnection = async () => {
    setError('');
    setConnectionStatus('checking');
    try {
      await checkPrintAgentHealth(savedUrl);
      const [printerList, assignment] = await Promise.all([
        getPrinters(savedUrl),
        getPrinterAssignment(savedUrl)
      ]);
      setPrinters(printerList);
      setTicketPrinter(assignment.ticketPrinter || '');
      setCocinaPrinter(assignment.cocinaPrinter || '');
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('failed');
      setError('No se pudo conectar con el servicio de impresión. Verifica que esté encendido y en la misma red WiFi.');
    }
  };

  const handleSaveAssignment = async () => {
    setError('');
    setSaving(true);
    try {
      await savePrinterAssignment(savedUrl, ticketPrinter, cocinaPrinter);
      setSuccess('Impresoras asignadas correctamente');
    } catch (err) {
      setError('No se pudo guardar la asignación de impresoras');
    } finally {
      setSaving(false);
    }
  };

  return {
    url, setUrl, savedUrl, loading,
    connectionStatus, handleTestConnection,
    printers, ticketPrinter, setTicketPrinter, cocinaPrinter, setCocinaPrinter,
    saving, handleSaveUrl, handleSaveAssignment,
    error, success
  };
};