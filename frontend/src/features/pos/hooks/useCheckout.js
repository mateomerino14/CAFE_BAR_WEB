import { useEffect, useState } from 'react';
import { getOrderTicket, getLatestOrderId, checkoutOrder } from '../services/posService';

export const useCheckout = (seccion, mesa, onSuccess) => {
  const [idVenta, setIdVenta] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [metodo, setMetodo] = useState('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [montoQr, setMontoQr] = useState('');
  const [pagoRecibido, setPagoRecibido] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getLatestOrderId(seccion.id_seccion, mesa.id_mesa).then((id) => {
      setIdVenta(id);
      getOrderTicket(id).then(setTicket);
    });
  }, [seccion, mesa]);

  useEffect(() => {
    if (!ticket) return;
    const total = Number(ticket.total);
    if (metodo === 'efectivo') {
      setMontoEfectivo(total.toFixed(2));
      setMontoQr('0.00');
    } else if (metodo === 'qr') {
      setMontoEfectivo('0.00');
      setMontoQr(total.toFixed(2));
    } else {
      setMontoEfectivo('');
      setMontoQr('');
    }
  }, [metodo, ticket]);

  const total = ticket ? Number(ticket.total) : 0;
  const cambio = pagoRecibido ? Number(pagoRecibido) - total : 0;

  const handleConfirm = async () => {
    setError('');

    if (metodo === 'mixto' && (!montoEfectivo || !montoQr)) {
      setError('Complete ambos montos para pago mixto');
      return;
    }

    setLoading(true);
    try {
      await checkoutOrder(idVenta, { metodo, montoEfectivo, montoQr });
      onSuccess(ticket);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return {
    ticket, metodo, setMetodo,
    montoEfectivo, setMontoEfectivo,
    montoQr, setMontoQr,
    pagoRecibido, setPagoRecibido,
    total, cambio,
    error, loading, handleConfirm
  };
};