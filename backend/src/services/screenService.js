import { query } from '../config/db.js';

/*Obtiene la estructura de pantallas y sus respectivas subpantallas, organizándolas en forma de árbol */
export const getScreensTree = async () => {
  const screensResult = await query(
    `SELECT id_pant, nom_pant FROM pantalla ORDER BY id_pant`
  );
  const subscreensResult = await query(
    `SELECT id_sub_pant, id_pant, nom_sub_pant, accion FROM subpantalla ORDER BY nom_sub_pant`
  );
  return screensResult.rows.map((screen) => ({
    id_pant: screen.id_pant,
    nom_pant: screen.nom_pant,
    subpantallas: subscreensResult.rows.filter((sub) => sub.id_pant === screen.id_pant)
  }));
};
