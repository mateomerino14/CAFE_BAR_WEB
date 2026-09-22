import { query } from '../config/db.js';

/*Verifica si ya existe una sección con el mismo nombre, permitiendo excluir una sección específica al editar */
const isSectionNameTaken = async (name, excludeId = null) => {
  const result = excludeId
    ? await query(`SELECT id_seccion FROM seccion WHERE nomb_seccion ILIKE $1 AND id_seccion != $2 LIMIT 1`, [name, excludeId])
    : await query(`SELECT id_seccion FROM seccion WHERE nomb_seccion ILIKE $1 LIMIT 1`, [name]);
  return Boolean(result.rows[0]);
};

/*Crea una nueva sección y genera la cantidad de mesas habilitadas indicada para ella */
export const createSection = async (nombre, descripcion, cantidadMesas) => {
  const nameTaken = await isSectionNameTaken(nombre);
  if (nameTaken) throw new Error('DUPLICATE_SECTION');
  const sectionResult = await query(
    `INSERT INTO seccion (nomb_seccion, descripcion) VALUES ($1, $2) RETURNING id_seccion`,
    [nombre, descripcion || null]
  );
  const section = sectionResult.rows[0];
  for (let i = 0; i < cantidadMesas; i++) {
    await query(`INSERT INTO mesa (id_seccion) VALUES ($1)`, [section.id_seccion]);
  }
  return section.id_seccion;
};

/*Obtiene todas las secciones junto con la cantidad de mesas habilitadas en cada una */
export const listSections = async () => {
  const sectionsResult = await query(
    `SELECT id_seccion, nomb_seccion, descripcion FROM seccion ORDER BY nomb_seccion`
  );
  const countsResult = await query(`SELECT * FROM get_section_table_counts()`);
  const countMap = new Map(countsResult.rows.map((row) => [row.id_seccion, Number(row.mesas_count)]));

  return sectionsResult.rows.map((section) => ({
    ...section,
    mesas_count: countMap.get(section.id_seccion) || 0
  }));
};

/*Obtiene la cantidad de mesas habilitadas que pertenecen a una sección específica */
export const getSectionTableCount = async (idSeccion) => {
  const result = await query(
    `SELECT COUNT(*) FROM mesa WHERE id_seccion = $1 AND existe = true`,
    [idSeccion]
  );
  return Number(result.rows[0].count) || 0;
};

/*Actualiza los datos de una sección y ajusta la cantidad de mesas habilitadas según la nueva cantidad indicada */
export const updateSection = async (idSeccion, nombre, descripcion, nuevaCantidad) => {
  const nameTaken = await isSectionNameTaken(nombre, idSeccion);
  if (nameTaken) throw new Error('DUPLICATE_SECTION');
  const habilitadaResult = await query(
    `SELECT COUNT(*) FROM mesa WHERE id_seccion = $1 AND existe = true`,
    [idSeccion]
  );
  const habilitada = Number(habilitadaResult.rows[0].count) || 0;
  if (habilitada >= nuevaCantidad) {
    const diferencia = habilitada - nuevaCantidad;
    if (diferencia > 0) {
      const toDisableResult = await query(
        `SELECT id_mesa FROM mesa WHERE id_seccion = $1 AND existe = true ORDER BY id_mesa DESC LIMIT $2`,
        [idSeccion, diferencia]
      );
      const ids = toDisableResult.rows.map((row) => row.id_mesa);
      if (ids.length > 0) {
        await query(
          `UPDATE mesa SET existe = false WHERE id_seccion = $1 AND id_mesa = ANY($2::int[])`,
          [idSeccion, ids]
        );
      }
    }
  } else {
    const resto = nuevaCantidad - habilitada;
    const toEnableResult = await query(
      `SELECT id_mesa FROM mesa WHERE id_seccion = $1 AND existe = false ORDER BY id_mesa ASC LIMIT $2`,
      [idSeccion, resto]
    );
    const enableIds = toEnableResult.rows.map((row) => row.id_mesa);
    if (enableIds.length > 0) {
      await query(
        `UPDATE mesa SET existe = true WHERE id_seccion = $1 AND id_mesa = ANY($2::int[])`,
        [idSeccion, enableIds]
      );
    }
    const restante = resto - enableIds.length;
    for (let i = 0; i < restante; i++) {
      await query(`INSERT INTO mesa (id_seccion) VALUES ($1)`, [idSeccion]);
    }
  }
  await query(
    `UPDATE seccion SET nomb_seccion = $1, descripcion = $2 WHERE id_seccion = $3`,
    [nombre, descripcion || null, idSeccion]
  );
};
