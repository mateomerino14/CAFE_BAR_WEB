import { useEffect, useState } from 'react';
import { getDailySaleDetails } from '../services/configService';

export const useSaleDetails = (idVenta) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idVenta) return;
    setLoading(true);
    getDailySaleDetails(idVenta)
      .then(setDetails)
      .finally(() => setLoading(false));
  }, [idVenta]);

  return { details, loading };
};