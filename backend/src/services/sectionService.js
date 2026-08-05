import { supabase } from '../config/supabaseClient.js';

const isSectionNameTaken = async (name, excludeId = null) => {
  let query = supabase.from('seccion').select('id_seccion').ilike('nomb_seccion', name);
  if (excludeId) query = query.neq('id_seccion', excludeId);
  const { data } = await query.maybeSingle();
  return Boolean(data);
};

export const createSection = async (nombre, descripcion, cantidadMesas) => {
  const nameTaken = await isSectionNameTaken(nombre);
  if (nameTaken) throw new Error('DUPLICATE_SECTION');
  const { data: section, error } = await supabase
    .from('seccion')
    .insert({ nomb_seccion: nombre, descripcion: descripcion || null })
    .select('id_seccion')
    .single();
  if (error) throw error;
  if (cantidadMesas > 0) {
    const rows = Array.from({ length: cantidadMesas }, () => ({ id_seccion: section.id_seccion }));
    const { error: insertError } = await supabase.from('mesa').insert(rows);
    if (insertError) throw insertError;
  }
  return section.id_seccion;
};

export const listSections = async () => {
  const { data: sections } = await supabase
    .from('seccion')
    .select('id_seccion, nomb_seccion, descripcion')
    .order('nomb_seccion');
  const { data: counts } = await supabase.rpc('get_section_table_counts');
  const countMap = new Map((counts || []).map((row) => [row.id_seccion, Number(row.mesas_count)]));
  return (sections || []).map((section) => ({
    ...section,
    mesas_count: countMap.get(section.id_seccion) || 0
  }));
};

export const getSectionTableCount = async (idSeccion) => {
  const { count } = await supabase
    .from('mesa')
    .select('*', { count: 'exact', head: true })
    .eq('id_seccion', idSeccion)
    .eq('existe', true);
  return count || 0;
};

export const updateSection = async (idSeccion, nombre, descripcion, nuevaCantidad) => {
  const nameTaken = await isSectionNameTaken(nombre, idSeccion);
  if (nameTaken) throw new Error('DUPLICATE_SECTION');
  const { count: cantidadHabilitada } = await supabase
    .from('mesa')
    .select('*', { count: 'exact', head: true })
    .eq('id_seccion', idSeccion)
    .eq('existe', true);
  const habilitada = cantidadHabilitada || 0;
  if (habilitada >= nuevaCantidad) {
    const diferencia = habilitada - nuevaCantidad;
    if (diferencia > 0) {
      const { data: toDisable } = await supabase
        .from('mesa')
        .select('id_mesa')
        .eq('id_seccion', idSeccion)
        .eq('existe', true)
        .order('id_mesa', { ascending: false })
        .limit(diferencia);
      const ids = (toDisable || []).map((row) => row.id_mesa);
      if (ids.length > 0) {
        await supabase.from('mesa').update({ existe: false }).eq('id_seccion', idSeccion).in('id_mesa', ids);
      }
    }
  } else {
    const resto = nuevaCantidad - habilitada;
    const { data: toEnable } = await supabase
      .from('mesa')
      .select('id_mesa')
      .eq('id_seccion', idSeccion)
      .eq('existe', false)
      .order('id_mesa', { ascending: true })
      .limit(resto);
    const enableIds = (toEnable || []).map((row) => row.id_mesa);
    if (enableIds.length > 0) {
      await supabase.from('mesa').update({ existe: true }).eq('id_seccion', idSeccion).in('id_mesa', enableIds);
    }
    const restante = resto - enableIds.length;
    if (restante > 0) {
      const rows = Array.from({ length: restante }, () => ({ id_seccion: idSeccion }));
      const { error: insertError } = await supabase.from('mesa').insert(rows);
      if (insertError) throw insertError;
    }
  }
  const { error } = await supabase
    .from('seccion')
    .update({ nomb_seccion: nombre, descripcion: descripcion || null })
    .eq('id_seccion', idSeccion);
  if (error) throw error;
};