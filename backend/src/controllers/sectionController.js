import {createSection, listSections, getSectionTableCount, updateSection} from '../services/sectionService.js';
import {isLettersOnly, isNumeric} from '../utils/validators.js';

/* Controlador para registrar una nueva sección */
export const createSectionHandler = async (req, res) => {
  const {nombre, descripcion, cantidadMesas} = req.body;
  if (!nombre || !nombre.trim() || cantidadMesas === undefined || cantidadMesas === '') {
    return res.status(400).json({message: 'Rellene los campos solicitados'});
  }
  if (!isLettersOnly(nombre)) {
    return res.status(400).json({message: 'El nombre de la sección solo debe contener letras'});
  }
  if (!isNumeric(String(cantidadMesas)) || Number(cantidadMesas) < 0) {
    return res.status(400).json({message: 'La cantidad de mesas debe ser un número válido'});
  }
  try {
    await createSection(nombre.trim(), descripcion?.trim(), Number(cantidadMesas));
    return res.status(201).json({message: 'Se ha registrado con éxito'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_SECTION') {
      return res.status(409).json({message: 'Este nombre de sección ya ha sido registrado'});
    }
    return res.status(500).json({message: 'No se pudo registrar la sección'});
  }
};

/* Controlador para listar las secciones disponibles */
export const listSectionsHandler = async (req, res) => {
  try {
    const sections = await listSections();
    return res.json(sections);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener secciones'});
  }
};

/* Controlador para obtener la cantidad de mesas asociadas a una sección */
export const getSectionTableCountHandler = async (req, res) => {
  try {
    const count = await getSectionTableCount(req.params.id);
    return res.json({count});
  } catch (error) {
    return res.status(500).json({message: 'Error al obtener las mesas'});
  }
};

/* Controlador para modificar una sección */
export const updateSectionHandler = async (req, res) => {
  const { nombre, descripcion, cantidadMesas } = req.body;
  if (!nombre || !nombre.trim() || cantidadMesas === undefined || cantidadMesas === '') {
    return res.status(400).json({message: 'Rellene los campos solicitados'});
  }
  if (!isLettersOnly(nombre)) {
    return res.status(400).json({message: 'El nombre de la sección solo debe contener letras'});
  }
  if (!isNumeric(String(cantidadMesas)) || Number(cantidadMesas) < 0) {
    return res.status(400).json({message: 'La cantidad de mesas debe ser un número válido'});
  }
  try {
    await updateSection(req.params.id, nombre.trim(), descripcion?.trim(), Number(cantidadMesas));
    return res.json({message: 'Se ha registrado con éxito la modificación'});
  } 
  catch (error) {
    if (error.message === 'DUPLICATE_SECTION') {
      return res.status(409).json({message: 'Ya existe una sección con ese nombre'});
    }
    return res.status(500).json({message: 'No se pudo modificar la sección'});
  }
};