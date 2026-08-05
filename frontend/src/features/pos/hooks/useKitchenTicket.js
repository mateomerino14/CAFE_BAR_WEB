import { useEffect, useState } from 'react';
import { getKitchenTicket } from '../services/posService';

export const useKitchenTicket = (idVenta, fecha) => {
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!idVenta || !fecha) return;
    getKitchenTicket(idVenta, fecha).then(setTicket);
  }, [idVenta, fecha]);

  return ticket;
};