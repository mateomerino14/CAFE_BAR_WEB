-- =====================================================================
-- DATOS DE PRUEBA 
-- =====================================================================

-- Cargo de prueba
INSERT INTO cargo (nom_carg) VALUES ('Mesero')
ON CONFLICT (nom_carg) DO NOTHING;

-- 8 empleados de prueba con el cargo "Mesero"
INSERT INTO empleado (
    alias_emp, cont_emp, ci_emp, nom_emp, apell_pat_emp, apell_mat_emp,
    num_cel_emp, direccion_emp, id_cargo, img_emp, disponible_emp
)
SELECT
    'empleado' || n,
    '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01',  -- contraseña de relleno, no funcional
    1000000 + n,
    'Nombre' || n,
    'Apellido' || n,
    'Materno' || n,
    70000000 + n,
    'Direccion ' || n,
    (SELECT id_cargo FROM cargo WHERE nom_carg = 'Mesero'),
    'https://i.pravatar.cc/150?img=' || n,
    TRUE
FROM generate_series(1, 8) AS n;

-- Categorías base de ejemplo
INSERT INTO categoria (nombre_categoria)
SELECT v.nombre FROM (VALUES
    ('Cafetería'),
    ('Bebidas'),
    ('Cervezas & Licores'),
    ('Comidas & Snacking')
) AS v(nombre)
WHERE NOT EXISTS (
    SELECT 1 FROM categoria c WHERE c.nombre_categoria = v.nombre
);
