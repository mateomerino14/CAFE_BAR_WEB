import { useEffect, useState } from 'react';
import { useAutoDismiss } from '../../../hooks/useAutoDismiss';
import { getDeletionData, getDependencyTree, executeDeletion } from '../services/deletionService';

export const usePhysicalDeletion = () => {
  const [activeTab, setActiveTab] = useState('empleados');
  const [data, setData] = useState({ empleados: [], cargos: [], secciones: [], ventas: [] });
  const [filtroEmpleados, setFiltroEmpleados] = useState('todas');
  const [selected, setSelected] = useState({ empleados: new Set(), cargos: new Set(), secciones: new Set(), ventas: new Set() });
  const [loading, setLoading] = useState(true);
  const [tree, setTree] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useAutoDismiss(error, () => setError(''));

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getDeletionData(filtroEmpleados);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEmpleados]);

  const toggleSelected = (tab, id) => {
    setSelected((prev) => {
      const next = new Set(prev[tab]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [tab]: next };
    });
  };

  const selectAll = (tab, ids) => setSelected((prev) => ({ ...prev, [tab]: new Set(ids) }));
  const deselectAll = (tab) => setSelected((prev) => ({ ...prev, [tab]: new Set() }));
  const invertSelection = (tab, allIds) => {
    setSelected((prev) => {
      const current = prev[tab];
      const next = new Set(allIds.filter((id) => !current.has(id)));
      return { ...prev, [tab]: next };
    });
  };

  const totalSelected = selected.empleados.size + selected.cargos.size + selected.secciones.size + selected.ventas.size;

  const buildPayload = () => ({
    empleados: Array.from(selected.empleados),
    cargos: Array.from(selected.cargos),
    secciones: Array.from(selected.secciones),
    ventas: Array.from(selected.ventas)
  });

  const handleRequestDelete = async () => {
    setError('');
    if (totalSelected === 0) {
      setError('No hay registros seleccionados para eliminar');
      return;
    }

    try {
      const dependencyTree = await getDependencyTree(buildPayload());
      setTree(dependencyTree);
      setConfirming(true);
    } catch (err) {
      setError('No se pudo calcular las dependencias');
    }
  };

  const handleConfirmDelete = async () => {
    setExecuting(true);
    try {
      await executeDeletion(buildPayload());
      setSuccess('Eliminación completada correctamente');
      setConfirming(false);
      setSelected({ empleados: new Set(), cargos: new Set(), secciones: new Set(), ventas: new Set() });
      fetchData();
    } catch (err) {
      setError('Ocurrió un error durante la eliminación');
    } finally {
      setExecuting(false);
    }
  };

  return {
    activeTab, setActiveTab,
    data, loading,
    filtroEmpleados, setFiltroEmpleados,
    selected, toggleSelected, selectAll, deselectAll, invertSelection,
    totalSelected,
    tree, confirming, setConfirming, executing,
    handleRequestDelete, handleConfirmDelete,
    error, success
  };
};