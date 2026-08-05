import { useEffect, useState } from 'react';
import { getOrderTicket } from '../services/posService';

export const useOrderTicket = (idVenta) => {
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    if (!idVenta) return;
    getOrderTicket(idVenta).then(setTicket);
  }, [idVenta]);

  return ticket;
};