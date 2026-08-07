import { getScreensTree } from '../services/screenService.js';

/* Controlador para obtener el árbol de pantallas del sistema */
export const getScreensTreeHandler = async (req, res) => {
  try {
    const tree = await getScreensTree();
    return res.json(tree);
  } 
  catch (error) {
    return res.status(500).json({message: 'Error al obtener las pantallas'});
  }
};