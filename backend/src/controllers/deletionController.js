import {
  listEmployeesForDeletion, listCargosForDeletion, listSeccionesForDeletion, listVentasForDeletion,
  buildDependencyTree, deleteEmpleados, deleteCargos, deleteSecciones, deleteVentasDirect
} from '../services/deletionService.js';

export const listDeletionDataHandler = async (req, res) => {
  const { filtroEmpleados } = req.query;
  try {
    const [empleados, cargos, secciones, ventas] = await Promise.all([
      listEmployeesForDeletion(filtroEmpleados),
      listCargosForDeletion(),
      listSeccionesForDeletion(),
      listVentasForDeletion()
    ]);
    return res.json({ empleados, cargos, secciones, ventas });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al cargar los datos' });
  }
};

export const getDependencyTreeHandler = async (req, res) => {
  try {
    const dependientes = await buildDependencyTree(req.body);
    return res.json(dependientes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al calcular dependencias' });
  }
};

export const executeDeletionHandler = async (req, res) => {
  const { empleados = [], cargos = [], secciones = [], ventas = [] } = req.body;

  try {
    if (empleados.length > 0) await deleteEmpleados(empleados);
    if (cargos.length > 0) await deleteCargos(cargos);
    if (secciones.length > 0) await deleteSecciones(secciones);
    if (ventas.length > 0) await deleteVentasDirect(ventas);

    return res.json({ message: 'Eliminación completada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Ocurrió un error durante la eliminación' });
  }
};