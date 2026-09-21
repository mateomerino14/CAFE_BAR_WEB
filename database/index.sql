-- =====================================================================
-- Categorías, subcategorías, productos
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_subcategoria_categoria      ON subcategoria(id_categoria);
CREATE INDEX IF NOT EXISTS idx_producto_subcategoria       ON producto(id_subcategoria);
CREATE INDEX IF NOT EXISTS idx_producto_activo             ON producto(activo) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_productos_ingredientes_ing  ON productos_ingredientes(id_ing);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categoria_nombre_lower ON categoria (LOWER(nombre_categoria));
CREATE UNIQUE INDEX IF NOT EXISTS idx_subcategoria_nombre_lower ON subcategoria (id_categoria, LOWER(nombre));
CREATE UNIQUE INDEX IF NOT EXISTS idx_producto_nombre_lower ON producto (LOWER(nom_prod));

-- =====================================================================
-- Stock de ingredientes
-- =====================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_nombre_lower ON stock (LOWER(nom_ing));

-- =====================================================================
-- Mesas y secciones
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_mesa_seccion ON mesa(id_seccion);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seccion_nombre_lower ON seccion (LOWER(nomb_seccion));

-- =====================================================================
-- Empleados y login
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_empleado_cargo       ON empleado(id_cargo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_empleado_alias_lower ON empleado (LOWER(alias_emp));
CREATE UNIQUE INDEX IF NOT EXISTS idx_empleado_correo_lower ON empleado (LOWER(correo_el_emp)) WHERE correo_el_emp IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_empleado_disponible  ON empleado(disponible_emp) WHERE disponible_emp = TRUE;

-- =====================================================================
-- Permisos por cargo
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_permisos_cargo_pant                ON permisos_cargo(id_pant);
CREATE INDEX IF NOT EXISTS idx_permisos_cargo_subpant_subpant     ON permisos_cargo_subpantalla(id_sub_pant);
CREATE INDEX IF NOT EXISTS idx_subpantalla_pant                   ON subpantalla(id_pant);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cargo_nombre_lower ON cargo (LOWER(nom_carg));

-- =====================================================================
-- Promociones
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_promocion_activo       ON promocion(activo) WHERE activo = TRUE;
CREATE INDEX IF NOT EXISTS idx_promocion_dias_prom    ON promocion_dias(id_prom);
CREATE INDEX IF NOT EXISTS idx_promocion_prod_prod    ON promocion_prod(id_prod);
CREATE UNIQUE INDEX IF NOT EXISTS idx_promocion_nombre_lower ON promocion (LOWER(nom_prom));

-- =====================================================================
-- Ventas: esto es lo que más se consulta (reportes por fecha, ventas por mesa, etc.)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_venta_fecha_reg    ON venta(fecha_reg);
CREATE INDEX IF NOT EXISTS idx_venta_cod_emp      ON venta(cod_emp);
CREATE INDEX IF NOT EXISTS idx_venta_cod_emp2     ON venta(cod_emp2);
CREATE INDEX IF NOT EXISTS idx_venta_mesa_seccion ON venta(id_mesa, id_seccion);
CREATE INDEX IF NOT EXISTS idx_venta_nit          ON venta(nit);
CREATE INDEX IF NOT EXISTS idx_venta_num_venta    ON venta(num_venta);

-- =====================================================================
-- Pagos
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_pago_venta   ON pago(id_venta);
CREATE INDEX IF NOT EXISTS idx_pago_metodo  ON pago(id_metodo);

-- =====================================================================
-- Detalle de venta: se consulta muchísimo por id_venta (armar el ticket, los reportes, etc.)
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_detalles_venta_venta    ON detalles_venta(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalles_venta_prod     ON detalles_venta(id_prod);
CREATE INDEX IF NOT EXISTS idx_detalles_venta_prom     ON detalles_venta(id_prom);
CREATE INDEX IF NOT EXISTS idx_detalles_venta_estado   ON detalles_venta(estado_detalle_venta);
CREATE INDEX IF NOT EXISTS idx_detalles_venta_mesero   ON detalles_venta(id_mesero_actual);

-- =====================================================================
-- Exclusiones, extras y unidades individuales del pedido
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_dv_exclusiones_detalle        ON detalles_venta_exclusiones(id_detalle_venta);
CREATE INDEX IF NOT EXISTS idx_dv_exclusiones_promo_detalle  ON detalles_venta_exclusiones_promo(id_detalle_venta);
CREATE INDEX IF NOT EXISTS idx_dv_extras_detalle             ON detalles_venta_extras(id_detalle_venta);
CREATE INDEX IF NOT EXISTS idx_dv_unidades_detalle           ON detalles_venta_unidades(id_detalle_venta);
CREATE INDEX IF NOT EXISTS idx_dv_unidades_prod              ON detalles_venta_unidades(id_prod);

-- =====================================================================
-- Recuperación de contraseña
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_password_reset_cod_emp ON password_reset_codes(cod_emp);
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_codes(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_code ON password_reset_codes(code) WHERE used = FALSE;


