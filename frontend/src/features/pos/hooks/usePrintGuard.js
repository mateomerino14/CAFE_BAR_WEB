import { useState } from 'react';
import { verifyPassword } from '../services/posService';

export const usePrintGuard = () => {
  const [ticketCount, setTicketCount] = useState(0);
  const [cocinaCount, setCocinaCount] = useState(0);
  const [pendingAction, setPendingAction] = useState(null);
  const [error, setError] = useState('');

  const requestPrint = (type, action) => {
    const count = type === 'ticket' ? ticketCount : cocinaCount;
    if (count >= 2) {
      setPendingAction({ type, action });
      return;
    }
    action();
  };

  const recordPrint = (type) => {
    if (type === 'ticket') setTicketCount((c) => c + 1);
    else setCocinaCount((c) => c + 1);
  };

  const confirmWithPassword = async (password) => {
    setError('');
    try {
      const { valid } = await verifyPassword(password);
      if (!valid) {
        setError('Contraseña incorrecta');
        return;
      }
      pendingAction.action();
      setPendingAction(null);
    } catch (err) {
      setError('No se pudo verificar la contraseña');
    }
  };

  const cancelPending = () => {
    setPendingAction(null);
    setError('');
  };

  const resetCounts = () => {
    setTicketCount(0);
    setCocinaCount(0);
  };

  return { requestPrint, recordPrint, pendingAction, confirmWithPassword, cancelPending, error, resetCounts };
};