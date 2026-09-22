-- =====================================================================
-- FUNCIONES ADMINISTRATIVAS Y DE CONTROL DE VENTAS
-- =====================================================================

-- Vacía una tabla antes de importar datos desde Excel
CREATE OR REPLACE FUNCTION admin_truncate_table(target_table text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('DELETE FROM %I WHERE true', target_table);
END;
$$;

-- Obtiene el siguiente número de venta para una fecha
CREATE OR REPLACE FUNCTION get_next_daily_sale_number(p_fecha DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_numero INTEGER;
BEGIN
  INSERT INTO venta_daily_counter (fecha, ultimo_numero)
  VALUES (p_fecha, 1)
  ON CONFLICT (fecha) DO UPDATE SET ultimo_numero = venta_daily_counter.ultimo_numero + 1
  RETURNING ultimo_numero INTO v_numero;
  RETURN v_numero;
END;
$$;


-- Ajusta la secuencia de IDs según los datos importados
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


