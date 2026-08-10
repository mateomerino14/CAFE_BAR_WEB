import {supabase} from '../config/supabaseClient.js';


/*Obtiene la estructura de pantallas y sus respectivas subpantallas, organizándolas en forma de árbol.*/
export const getScreensTree = async () => {
  const {data: screens} = await supabase.from('pantalla').select('id_pant, nom_pant').order('id_pant');
  const {data: subscreens} = await supabase
    .from('subpantalla')
    .select('id_sub_pant, id_pant, nom_sub_pant, accion')
    .order('nom_sub_pant');
  return (screens || []).map((screen) => ({
    id_pant: screen.id_pant,
    nom_pant: screen.nom_pant,
    subpantallas: (subscreens || []).filter((sub) => sub.id_pant === screen.id_pant)
  }));
};