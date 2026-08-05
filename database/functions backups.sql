-- =====================================================================
-- admin_truncate_table
-- Vacía por completo una tabla (borra TODAS sus filas), recibiendo el nombre de la tabla como texto. 
-- Se usa antes de volver a cargar los  datos desde el Excel que se está importando.
-- =====================================================================
CREATE OR REPLACE FUNCTION admin_truncate_table(target_table text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('DELETE FROM %I WHERE true', target_table);
END;
$$;


-- =====================================================================
-- admin_reset_sequence
-- Después de importar datos con IDs "viejos" (que ya traían su propio número desde el Excel).
-- Esta función le avisa a Postgres cuál es el próximo número que debe usar para esa tabla, para que no intente repetir un ID que ya existe en los datos recién importados.
-- =====================================================================
CREATE OR REPLACE FUNCTION admin_reset_sequence(target_table text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pk_col text;
  seq_name text;
  max_id bigint;
BEGIN
  SELECT a.attname INTO pk_col
  FROM pg_index i
  JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
  WHERE i.indrelid = target_table::regclass AND i.indisprimary
  LIMIT 1;

  IF pk_col IS NULL THEN
    RETURN;
  END IF;
  seq_name := pg_get_serial_sequence(target_table, pk_col);
  IF seq_name IS NULL THEN
    RETURN;
  END IF;
  EXECUTE format('SELECT COALESCE(MAX(%I), 0) FROM %I', pk_col, target_table) INTO max_id;
  EXECUTE format('SELECT setval(%L, %s, true)', seq_name, GREATEST(max_id, 1));
END;
$$;