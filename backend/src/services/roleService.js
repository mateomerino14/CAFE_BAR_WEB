import {supabase} from '../config/supabaseClient.js';


/*Crea un nuevo cargo y asigna las subpantallas que tendrá disponibles.*/
export const createRole = async (nombre, subpantallaIds) => {
  const {data: existing} = await supabase
    .from('cargo')
    .select('id_cargo')
    .ilike('nom_carg', nombre)
    .maybeSingle();
  if (existing) throw new Error('DUPLICATE_NAME');
  const { data: cargo, error } = await supabase
    .from('cargo')
    .insert({ nom_carg: nombre })
    .select('id_cargo')
    .single();
  if (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_NAME');
    throw error;
  }
  const rows = subpantallaIds.map((idSubPant) => ({id_carg: cargo.id_cargo, id_sub_pant: idSubPant}));
  await supabase.from('permisos_cargo_subpantalla').insert(rows);
  return cargo.id_cargo;
};


/*Obtiene los nombres de todos los cargos ordenados alfabéticamente.*/
export const listRoleNames = async () => {
  const {data} = await supabase.from('cargo').select('nom_carg').order('nom_carg');
  return (data || []).map((row) => row.nom_carg);
};


/*Obtiene los cargos y organiza sus permisos agrupándolos por pantalla y subpantalla, permitiendo filtrar por nombre.*/
export const listRoles = async (search) => {
  let query = supabase.from('cargo').select('id_cargo, nom_carg').order('nom_carg');
  if (search) query = query.ilike('nom_carg', `${search}%`);
  const {data: cargos} = await query;
  const {data: permissions} = await supabase
    .from('permisos_cargo_subpantalla')
    .select('id_carg, subpantalla:subpantalla(nom_sub_pant, pantalla:pantalla(nom_pant))');
  return (cargos || []).map((cargo) => {
    const grouped = {};
    (permissions || [])
      .filter((permission) => permission.id_carg === cargo.id_cargo)
      .forEach((permission) => {
        const screenName = permission.subpantalla?.pantalla?.nom_pant;
        const subName = permission.subpantalla?.nom_sub_pant;
        if (!screenName || !subName) {
          return;
        }
        if (!grouped[screenName]) {
          grouped[screenName] = [];
        }
        grouped[screenName].push(subName);
      });
    return {id_cargo: cargo.id_cargo, nom_carg: cargo.nom_carg, permissions: grouped};
  });
};


/*Obtiene los identificadores de las subpantallas que tiene asignadas un cargo.*/
export const getRolePermissions = async (idCargo) => {
  const { data } = await supabase
    .from('permisos_cargo_subpantalla')
    .select('id_sub_pant')
    .eq('id_carg', idCargo);
  return (data || []).map((row) => row.id_sub_pant);
};


/*Actualiza los permisos de un cargo reemplazando las subpantallas asignadas por las nuevas seleccionadas.*/
export const updateRolePermissions = async (idCargo, subpantallaIds) => {
  if (subpantallaIds.length === 0) throw new Error('EMPTY_PERMISSIONS');
  await supabase.from('permisos_cargo_subpantalla').delete().eq('id_carg', idCargo);
  const rows = subpantallaIds.map((idSubPant) => ({id_carg: idCargo, id_sub_pant: idSubPant}));
  await supabase.from('permisos_cargo_subpantalla').insert(rows);
};


/*Obtiene la lista de cargos con sus identificadores y nombres para utilizarlos como opciones de selección.*/
export const listRoleOptions = async () => {
  const {data} = await supabase.from('cargo').select('id_cargo, nom_carg').order('nom_carg');
  return data || [];
};