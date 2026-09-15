import { query } from '../config/db.js';

/*Crea un nuevo cargo y asigna las subpantallas que tendrá disponibles.*/
export const createRole = async (nombre, subpantallaIds) => {
  const existingResult = await query(
    `SELECT id_cargo FROM cargo WHERE nom_carg ILIKE $1 LIMIT 1`,
    [nombre]
  );
  if (existingResult.rows[0]) throw new Error('DUPLICATE_NAME');

  let cargo;
  try {
    const insertResult = await query(
      `INSERT INTO cargo (nom_carg) VALUES ($1) RETURNING id_cargo`,
      [nombre]
    );
    cargo = insertResult.rows[0];
  } catch (error) {
    if (error.code === '23505') throw new Error('DUPLICATE_NAME');
    throw error;
  }

  for (const idSubPant of subpantallaIds) {
    await query(
      `INSERT INTO permisos_cargo_subpantalla (id_carg, id_sub_pant) VALUES ($1, $2)`,
      [cargo.id_cargo, idSubPant]
    );
  }
  return cargo.id_cargo;
};

/*Obtiene los nombres de todos los cargos ordenados alfabéticamente.*/
export const listRoleNames = async () => {
  const result = await query(`SELECT nom_carg FROM cargo ORDER BY nom_carg`);
  return result.rows.map((row) => row.nom_carg);
};

/*Obtiene los cargos y organiza sus permisos agrupándolos por pantalla y subpantalla, permitiendo filtrar por nombre.*/
export const listRoles = async (search) => {
  const cargosResult = search
    ? await query(`SELECT id_cargo, nom_carg FROM cargo WHERE nom_carg ILIKE $1 ORDER BY nom_carg`, [`${search}%`])
    : await query(`SELECT id_cargo, nom_carg FROM cargo ORDER BY nom_carg`);

  const permissionsResult = await query(
    `SELECT pcs.id_carg, sp.nom_sub_pant, p.nom_pant
     FROM permisos_cargo_subpantalla pcs
     JOIN subpantalla sp ON sp.id_sub_pant = pcs.id_sub_pant
     JOIN pantalla p ON p.id_pant = sp.id_pant`
  );

  return cargosResult.rows.map((cargo) => {
    const grouped = {};
    permissionsResult.rows
      .filter((permission) => permission.id_carg === cargo.id_cargo)
      .forEach((permission) => {
        const screenName = permission.nom_pant;
        const subName = permission.nom_sub_pant;
        if (!screenName || !subName) return;
        if (!grouped[screenName]) grouped[screenName] = [];
        grouped[screenName].push(subName);
      });
    return { id_cargo: cargo.id_cargo, nom_carg: cargo.nom_carg, permissions: grouped };
  });
};

/*Obtiene los identificadores de las subpantallas que tiene asignadas un cargo.*/
export const getRolePermissions = async (idCargo) => {
  const result = await query(
    `SELECT id_sub_pant FROM permisos_cargo_subpantalla WHERE id_carg = $1`,
    [idCargo]
  );
  return result.rows.map((row) => row.id_sub_pant);
};

/*Actualiza los permisos de un cargo reemplazando las subpantallas asignadas por las nuevas seleccionadas.*/
export const updateRolePermissions = async (idCargo, subpantallaIds) => {
  if (subpantallaIds.length === 0) throw new Error('EMPTY_PERMISSIONS');
  await query(`DELETE FROM permisos_cargo_subpantalla WHERE id_carg = $1`, [idCargo]);
  for (const idSubPant of subpantallaIds) {
    await query(
      `INSERT INTO permisos_cargo_subpantalla (id_carg, id_sub_pant) VALUES ($1, $2)`,
      [idCargo, idSubPant]
    );
  }
};

/*Obtiene la lista de cargos con sus identificadores y nombres para utilizarlos como opciones de selección.*/
export const listRoleOptions = async () => {
  const result = await query(`SELECT id_cargo, nom_carg FROM cargo ORDER BY nom_carg`);
  return result.rows;
};
