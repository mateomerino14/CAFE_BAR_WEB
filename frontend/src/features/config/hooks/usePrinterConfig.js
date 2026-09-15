import { useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getPrinters, getPrinterAssignment, savePrinterAssignment } from '../services/printAgentService';

export const usePrinterConfig = () => {
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [printers, setPrinters] = useState([]);
  const [ticketPrinter, setTicketPrinter] = useState('');
  const [cocinaPrinter, setCocinaPrinter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  const handleTestConnection = async () => {
    setError('');
    setConnectionStatus('checking');
    try {
      const [printerList, assignment] = await Promise.all([getPrinters(), getPrinterAssignment()]);
      setPrinters(printerList);
      setTicketPrinter(assignment.ticketPrinter || '');
      setCocinaPrinter(assignment.cocinaPrinter || '');
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('failed');
      setError('No se pudo obtener la lista de impresoras de esta computadora');
    }
  };

  const handleSaveAssignment = async () => {
    setError('');
    setSaving(true);
    try {
      await savePrinterAssignment(ticketPrinter, cocinaPrinter);
      setSuccess('Impresoras asignadas correctamente');
    } catch (err) {
      setError('No se pudo guardar la asignación de impresoras');
    } finally {
      setSaving(false);
    }
  };

  return {
    connectionStatus, handleTestConnection,
    printers, ticketPrinter, setTicketPrinter, cocinaPrinter, setCocinaPrinter,
    saving, handleSaveAssignment,
    error, success
  };
};
