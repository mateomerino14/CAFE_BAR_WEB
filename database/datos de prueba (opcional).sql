-- =====================================================================
-- DATOS DE PRUEBA — NO SE EJECUTA AUTOMÁTICAMENTE
-- =====================================================================
-- Este archivo NO forma parte de la instalación automática de la app
-- (no está en la lista de electron/migrate.js) — así que una instalación
-- real, en la PC de un cliente, nunca va a crear estos empleados falsos.
--
-- Solo sirve si estás desarrollando/probando el sistema y quieres tener
-- algunos empleados de ejemplo para trabajar. Si lo necesitas, corre
-- este archivo a mano contra el Postgres embebido (con la app cerrada),
-- usando cualquier cliente de Postgres (psql, DBeaver, etc.).
--
-- IMPORTANTE: la contraseña de estos empleados es de relleno, no sirve
-- para iniciar sesión tal cual. Si quieres probarlos de verdad, entra
-- como DIRECTORIO y usa "Modificar Empleado" para resetearles la
-- contraseña desde ahí (eso sí genera una contraseña real y utilizable).
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
