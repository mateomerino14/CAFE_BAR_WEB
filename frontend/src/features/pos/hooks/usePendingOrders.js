import { useEffect, useState } from 'react';
import { getPendingBatches } from '../services/posService';

export const usePendingOrders = (seccion, mesa, isOpen) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFecha, setExpandedFecha] = useState(null);
  const [markingFecha, setMarkingFecha] = useState(null);

  const fetchBatches = () => {
    if (!seccion || !mesa) return;
    setLoading(true);
    getPendingBatches(seccion.id_seccion, mesa.id_mesa)
      .then(setBatches)
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) fetchBatches();
  }, [isOpen, seccion, mesa]);

  const toggleExpand = (fecha) => setExpandedFecha((prev) => (prev === fecha ? null : fecha));
  const openMarking = (fecha) => setMarkingFecha(fecha);
  const closeMarking = () => {
    setMarkingFecha(null);
    fetchBatches();
  };

  const getElapsedStatus = (fecha) => {
    const minutos = Math.floor((Date.now() - new Date(fecha).getTime()) / 60000);
    if (minutos < 10) return { label: `Reciente - Hace ${minutos} min`, variant: 'recent' };
    if (minutos < 20) return { label: `En espera - Hace ${minutos} min`, variant: 'waiting' };
    return { label: `Urgente - Hace ${minutos} min`, variant: 'urgent' };
  };

  return { batches, loading, expandedFecha, toggleExpand, markingFecha, openMarking, closeMarking, getElapsedStatus };
};