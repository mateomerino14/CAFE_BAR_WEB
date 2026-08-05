-- =====================================================================
-- INFORMACION BASICA PARA QUE EL SISTEMA SE EJECUTE
-- =====================================================================

-- =====================================================================
-- Pantallas principales del menú
-- =====================================================================
INSERT INTO pantalla (nom_pant) VALUES
    ('Familia'),
    ('Caja'),
    ('Administracion'),
    ('Productos'),
    ('Secciones'),
    ('Stock'),
    ('Promociones'),
    ('Empleados'),
    ('Reportes')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- Acciones o subpantalla de cada pantalla principal
-- =====================================================================

--('Administracion',   'Impresoras',               'IMPRESORAS'),
INSERT INTO subpantalla (id_pant, nom_sub_pant, accion)
SELECT p.id_pant, s.nom_sub_pant, s.accion
FROM (VALUES
    ('Familia',          'Ver Familia',              'VER_FAMILIA'),
    ('Caja',             'Registrar Pedido',         'REGISTRAR_PEDIDO'),
    ('Administracion',   'Configuración',            'CONFIGURACION'),
    ('Productos',        'Registrar Categoría',      'REGISTRAR_CATEGORIA'),
    ('Productos',        'Modificar Categoría',      'MODIFICAR_CATEGORIA'),
    ('Productos',        'Dar de Baja Categoría',    'BAJA_CATEGORIA'),
    ('Productos',        'Registrar Producto',       'REGISTRAR_PRODUCTO'),
    ('Productos',        'Modificar Producto',       'MODIFICAR_PRODUCTO'),
    ('Productos',        'Dar de Baja Producto',     'BAJA_PRODUCTO'),
    ('Secciones',        'Administrar Secciones',    'ADMIN_SECCIONES'),
    ('Stock',            'Registrar Ingredientes',   'REGISTRAR_INGREDIENTES'),
    ('Stock',            'Modificar Ingredientes',   'MODIFICAR_INGREDIENTES'),
    ('Promociones',      'Registrar Promociones',    'REGISTRAR_PROMOCIONES'),
    ('Promociones',      'Modificar Promociones',    'MODIFICAR_PROMOCIONES'),
    ('Promociones',      'Dar de Baja Promociones',  'BAJA_PROMOCIONES'),
    ('Empleados',        'Registrar Cargos',         'REGISTRAR_CARGOS'),
    ('Empleados',        'Modificar Cargos',         'MODIFICAR_CARGOS'),
    ('Empleados',        'Registrar Empleados',      'REGISTRAR_EMPLEADOS'),
    ('Empleados',        'Modificar Empleados',      'MODIFICAR_EMPLEADOS'),
    ('Empleados',        'Dar de Baja Empleados',    'BAJA_EMPLEADOS'),
    ('Reportes',         'Ver Reportes',             'VER_REPORTES')
) AS s(nom_pant, nom_sub_pant, accion)
JOIN pantalla p ON p.nom_pant = s.nom_pant
WHERE NOT EXISTS (
    SELECT 1 FROM subpantalla sp WHERE sp.accion = s.accion
);


-- =====================================================================
-- Formas de pago
-- =====================================================================
INSERT INTO metodo_pago (nombre)
SELECT v.nombre FROM (VALUES ('Efectivo'), ('Qr')) AS v(nombre)
WHERE NOT EXISTS (
    SELECT 1 FROM metodo_pago mp WHERE mp.nombre = v.nombre
);


-- =====================================================================
-- Enlace por defecto al portal de impuestos (editable luego desde Configuración)
-- =====================================================================
INSERT INTO enlace (enlace)
SELECT 'https://siat.impuestos.gob.bo/v2/launcher/'
WHERE NOT EXISTS (SELECT 1 FROM enlace);


-- =====================================================================
-- Categorías base de ejemplo 
-- =====================================================================
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


-- =====================================================================
-- DATOS DE PRUEBA (solo para desarrollo/pruebas, no usar en producción)
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

-- =====================================================================
-- El usuario DIRECTORIO no se crea aquí porque necesita una contraseña encriptada real (no de relleno como los empleados de prueba). 
-- Se crea corriendo, una sola vez, el script: backend/src/scripts/seedDirectorio.js
-- =====================================================================