-- =====================================================================
-- TRIGGERS DEL SISTEMA
-- =====================================================================

-- Asigna automáticamente el número de mesa dentro de su sección
CREATE OR REPLACE FUNCTION fn_asignar_mesa()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id_mesa IS NULL THEN
        SELECT COALESCE(MAX(id_mesa), 0) + 1
        INTO NEW.id_mesa
        FROM mesa
        WHERE id_seccion = NEW.id_seccion;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_asignar_mesa ON mesa;
CREATE TRIGGER trg_asignar_mesa
BEFORE INSERT ON mesa
FOR EACH ROW
EXECUTE FUNCTION fn_asignar_mesa();


-- Obtiene la cantidad de mesas activas por sección
CREATE OR REPLACE FUNCTION get_section_table_counts()
RETURNS TABLE(id_seccion BIGINT, mesas_count BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT id_seccion, COUNT(*) AS mesas_count
  FROM mesa
  WHERE existe = true
  GROUP BY id_seccion;
$$;