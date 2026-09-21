import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { usePosCart } from './usePosCart';
import { submitOrder, getNextSaleNumber } from '../services/posService';

export const useCajaPage = () => {
  const [seccion, setSeccion] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [mesero, setMesero] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [lastBatchFecha, setLastBatchFecha] = useState(null);
  const [lastNumVenta, setLastNumVenta] = useState(null);
  const [previewNumVenta, setPreviewNumVenta] = useState(null);
  const [ticketPrinted, setTicketPrinted] = useState(false);
  const [cocinaPrinted, setCocinaPrinted] = useState(false);
  const cart = usePosCart();

  useAutoDismiss(error, () => setError(''));
  useAutoDismiss(success, () => setSuccess(''));

  useEffect(() => {
    getNextSaleNumber().then(setPreviewNumVenta).catch(() => {});
    /* La vista previa del número de venta es solo un estimado (cuenta cuántas ventas hay hasta
       ahora) — si otro dispositivo registra una venta mientras esta mesa sigue abierta sin cobrar,
       el número mostrado queda desactualizado. Se refresca cada 15 segundos para reducir ese
       desfase, aunque el número real y definitivo solo se asigna al momento de cobrar. */
    const interval = setInterval(() => {
      getNextSaleNumber().then(setPreviewNumVenta).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [lastNumVenta]);

  const resetForNextOrder = () => {
    setSeccion(null);
    setMesa(null);
    setMesero(null);
    setLastOrderId(null);
    setLastBatchFecha(null);
    setLastNumVenta(null);
    setTicketPrinted(false);
    setCocinaPrinted(false);
    cart.reset();
  };

  const handleSelectTable = (selectedSeccion, selectedMesa) => {
    setSeccion(selectedSeccion);
    setMesa(selectedMesa);
    setLastOrderId(null);
    setLastBatchFecha(null);
    setLastNumVenta(null);
    setTicketPrinted(false);
    setCocinaPrinted(false);
  };

  const handleSelectMesero = (employee) => setMesero(employee);

  const ensureOrderRegistered = async () => {
    if (lastOrderId) return { idVenta: lastOrderId, batchFecha: lastBatchFecha };

    if (!seccion || !mesa) {
      setError('Seleccione una sección y mesa');
      return null;
    }
    if (!mesero) {
      setError('Seleccione el mesero que atiende');
      return null;
    }
    if (cart.items.length === 0) {
      setError('Debe contener por lo menos un producto la venta');
      return null;
    }

    setLoading(true);
    try {
      const data = await submitOrder({
        idMesa: mesa.id_mesa,
        idSeccion: seccion.id_seccion,
        idMesero: mesero.cod_emp,
        items: cart.items.map((item) =>
          item.type === 'product'
            ? {
                type: 'product',
                idProd: item.idProd,
                cantidad: Number(item.cantidad) || 1,
                tipoConsumo: item.tipoConsumo,
                exclusiones: item.exclusiones,
                extras: item.extras
              }
            : {
                type: 'promotion',
                idProm: item.idProm,
                cantidad: Number(item.cantidad) || 1,
                tipoConsumo: item.tipoConsumo,
                productCustomizations: item.productCustomizations
              }
        )
      });
      setLastOrderId(data.idVenta);
      setLastBatchFecha(data.batchFecha);
      setLastNumVenta(data.numVenta);
      setSuccess(`Venta N° ${data.numVenta} registrada con éxito`);
      cart.reset();
      return { idVenta: data.idVenta, batchFecha: data.batchFecha };
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la venta');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markTicketPrinted = () => setTicketPrinted(true);
  const markCocinaPrinted = () => setCocinaPrinted(true);

  useEffect(() => {
    if (ticketPrinted && cocinaPrinted) {
      setSuccess('Pedido completo: ticket y comanda impresos. Lista para la siguiente venta.');
      resetForNextOrder();
    }
  }, [ticketPrinted, cocinaPrinted]);

  return {
    seccion, mesa, mesero, handleSelectTable, handleSelectMesero, cart,
    error, success, loading,
    lastOrderId, lastBatchFecha, lastNumVenta, previewNumVenta,
    ticketPrinted, cocinaPrinted,
    ensureOrderRegistered, markTicketPrinted, markCocinaPrinted
  };
};