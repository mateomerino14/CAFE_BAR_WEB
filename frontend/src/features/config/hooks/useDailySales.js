import { useEffect, useState } from 'react';
import { getDailySalesSummary, getDailySales, getCajeroNames } from '../services/configService';

export const useDailySales = () => {
  const [summary, setSummary] = useState({ finalizadas: 0, montoFinalizado: 0, enPreparacion: 0, total: 0 });
  const [sales, setSales] = useState([]);
  const [cajeroNames, setCajeroNames] = useState([]);
  const [filtro, setFiltro] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedVenta, setSelectedVenta] = useState(null);

  const fetchAll = async (currentFiltro = filtro, currentBusqueda = busqueda) => {
    setLoading(true);
    try {
      const [summaryData, salesData] = await Promise.all([
        getDailySalesSummary(),
        getDailySales(currentFiltro, currentBusqueda)
      ]);
      setSummary(summaryData);
      setSales(salesData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    getCajeroNames().then(setCajeroNames).catch(() => setCajeroNames([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (nuevoFiltro) => {
    setFiltro(nuevoFiltro);
    fetchAll(nuevoFiltro, busqueda);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchAll(filtro, busqueda);
  };

  const handleSelectSuggestion = (nombre) => {
    setBusqueda(nombre);
    fetchAll(filtro, nombre);
  };

  const handleReload = () => {
    setFiltro(null);
    setBusqueda('');
    fetchAll(null, '');
  };

  return {
    summary, sales, cajeroNames, loading,
    filtro, handleFilter,
    busqueda, setBusqueda, handleSearch, handleSelectSuggestion,
    handleReload,
    selectedVenta, setSelectedVenta
  };
};