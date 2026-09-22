-- =====================================================================
-- CREACION DE TABLAS DE LA BASE DE DATOS
-- =====================================================================

-- Categorías de productos
CREATE TABLE IF NOT EXISTS categoria (
    id_categoria      BIGSERIAL PRIMARY KEY,
    nombre_categoria  VARCHAR(30) UNIQUE NOT NULL,
    imagen_categoria  TEXT,                       -- URL de la imagen en Supabase Storage
    activa            BOOLEAN NOT NULL DEFAULT TRUE
);

-- Subcategorías 
CREATE TABLE IF NOT EXISTS subcategoria (
    id_subcategoria     BIGSERIAL PRIMARY KEY,
    id_categoria        BIGINT NOT NULL REFERENCES categoria(id_categoria) ON DELETE RESTRICT,
    imagen_subcategoria TEXT,
    nombre              VARCHAR(50) NOT NULL,
    activa              BOOLEAN NOT NULL DEFAULT TRUE
);

-- Ingredientes del local 
CREATE TABLE IF NOT EXISTS stock (
    id_ing          BIGSERIAL PRIMARY KEY,
    nom_ing         VARCHAR(30) NOT NULL,
    descripcion     TEXT,
    cantidad_stock  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    disponible      BOOLEAN NOT NULL DEFAULT TRUE,
    unidad_medida   VARCHAR(10) NOT NULL,          -- ej: "kg", "lt", "unid"
    precio_extra    NUMERIC(10,2) NOT NULL DEFAULT 0.00  -- lo que se cobra si un cliente pide "extra" de este ingrediente
);

-- Productos que se venden 
CREATE TABLE IF NOT EXISTS producto (
    id_prod             BIGSERIAL PRIMARY KEY,
    nom_prod            VARCHAR(30) NOT NULL,
    descripcion         TEXT,
    precio_venta        NUMERIC(10,2) NOT NULL,
    costo_fabricacion   NUMERIC(10,2) NOT NULL,     -- cuánto le cuesta al local hacerlo (para calcular ganancia)
    activo              BOOLEAN NOT NULL DEFAULT TRUE,
    img_prod            TEXT,                       -- URL en Supabase Storage
    id_subcategoria     BIGINT NOT NULL REFERENCES subcategoria(id_subcategoria) ON DELETE RESTRICT
);

-- La "receta" de cada producto: qué ingredientes y cuánto necesita
CREATE TABLE IF NOT EXISTS productos_ingredientes (
    id_prod                  BIGINT NOT NULL REFERENCES producto(id_prod) ON DELETE CASCADE,
    id_ing                   BIGINT NOT NULL REFERENCES stock(id_ing) ON DELETE RESTRICT,
    cantidad_ing_necesitada  NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_prod, id_ing)
);

-- Secciones del restaurante 
CREATE TABLE IF NOT EXISTS seccion (
    id_seccion    BIGSERIAL PRIMARY KEY,
    nomb_seccion  VARCHAR(30) NOT NULL,
    descripcion   TEXT
);

-- Mesas de cada sección. 
CREATE TABLE IF NOT EXISTS mesa (
    id_mesa     INTEGER NOT NULL,
    disponible  BOOLEAN NOT NULL DEFAULT TRUE,      -- true = mesa libre, false = mesa ocupada
    existe      BOOLEAN NOT NULL DEFAULT TRUE,       -- para "eliminar" una mesa sin borrar su historial
    id_seccion  BIGINT NOT NULL REFERENCES seccion(id_seccion) ON DELETE RESTRICT,
    PRIMARY KEY (id_mesa, id_seccion)
);

-- Pantallas grandes del menu
CREATE TABLE IF NOT EXISTS pantalla (
    id_pant   BIGSERIAL PRIMARY KEY,
    nom_pant  VARCHAR(40) NOT NULL
);

-- Opciones concretas dentro de cada pantalla del menu
CREATE TABLE IF NOT EXISTS subpantalla (
    id_sub_pant   BIGSERIAL PRIMARY KEY,
    id_pant       BIGINT NOT NULL REFERENCES pantalla(id_pant) ON DELETE CASCADE,
    nom_sub_pant  VARCHAR(50) NOT NULL,
    accion        VARCHAR(50) NOT NULL
);

-- Cargos del personal 
CREATE TABLE IF NOT EXISTS cargo (
    id_cargo  BIGSERIAL PRIMARY KEY,
    nom_carg  VARCHAR(20) UNIQUE NOT NULL
);

-- Pantallas que puede ver cada cargo
CREATE TABLE IF NOT EXISTS permisos_cargo (
    id_carg  BIGINT NOT NULL REFERENCES cargo(id_cargo) ON DELETE CASCADE,
    id_pant  BIGINT NOT NULL REFERENCES pantalla(id_pant) ON DELETE CASCADE,
    PRIMARY KEY (id_carg, id_pant)
);

-- Acciones concretas puede hacer cada cargo dentro de esas pantallas
CREATE TABLE IF NOT EXISTS permisos_cargo_subpantalla (
    id_carg      BIGINT NOT NULL REFERENCES cargo(id_cargo) ON DELETE CASCADE,
    id_sub_pant  BIGINT NOT NULL REFERENCES subpantalla(id_sub_pant) ON DELETE CASCADE,
    PRIMARY KEY (id_carg, id_sub_pant)
);

-- Empleados del local
CREATE TABLE IF NOT EXISTS empleado (
    cod_emp         BIGSERIAL PRIMARY KEY,
    alias_emp       VARCHAR(30) NOT NULL UNIQUE,    -- el usuario con el que inicia sesión
    cont_emp        VARCHAR(255) NOT NULL,          -- contraseña ya encriptada 
    ci_emp          BIGINT NOT NULL,
    nom_emp         VARCHAR(30) NOT NULL,
    apell_pat_emp   VARCHAR(30) NOT NULL,
    apell_mat_emp   VARCHAR(30) NOT NULL,
    num_cel_emp     BIGINT NOT NULL,
    direccion_emp   VARCHAR(30) NOT NULL,
    correo_el_emp   VARCHAR(30),
    disponible_emp  BOOLEAN NOT NULL DEFAULT TRUE,   -- false = "dado de baja"
    id_cargo        BIGINT NOT NULL REFERENCES cargo(id_cargo) ON DELETE RESTRICT,
    img_emp         TEXT                             -- URL en Supabase Storage
);

-- Directorio o cargo principal del sistema
CREATE TABLE IF NOT EXISTS directorio (
    id_admin           BIGSERIAL PRIMARY KEY,
    nom_admin          VARCHAR(30) NOT NULL,
    contrasena_admin   VARCHAR(255) NOT NULL
);

-- Promociones de productos
CREATE TABLE IF NOT EXISTS promocion (
    id_prom           BIGSERIAL PRIMARY KEY,
    nom_prom          VARCHAR(30) NOT NULL,
    precio_prom       NUMERIC(10,2) NOT NULL,
    img_prom          TEXT,
    activo            BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_especifica  DATE,           -- si la promo es solo para un día puntual
    fecha_inicio      DATE,           -- si la promo es para un rango de fechas
    fecha_fin         DATE,
    hora_inicio       TIME NOT NULL DEFAULT '00:00:00',
    hora_fin          TIME NOT NULL DEFAULT '23:59:59'
);

-- Dias de la semana que está activa la promoción (0=Lunes ... 6=Domingo)
CREATE TABLE IF NOT EXISTS promocion_dias (
    id_prom     BIGINT NOT NULL REFERENCES promocion(id_prom) ON DELETE CASCADE,
    dia_semana  SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
    PRIMARY KEY (id_prom, dia_semana)
);

-- Productos con cantidades que forman la promocion
CREATE TABLE IF NOT EXISTS promocion_prod (
    id_prom             BIGINT NOT NULL REFERENCES promocion(id_prom) ON DELETE CASCADE,
    id_prod             BIGINT NOT NULL REFERENCES producto(id_prod) ON DELETE CASCADE,
    cantidad_prod_prom  INTEGER NOT NULL,
    PRIMARY KEY (id_prom, id_prod)
);

-- Formas de pago disponibles (Efectivo, QR)
CREATE TABLE IF NOT EXISTS metodo_pago (
    id_metodo  BIGSERIAL PRIMARY KEY,
    nombre     VARCHAR(50) NOT NULL
);

-- Informacion de venta desde su apertura (cajero, mesero, etc)
CREATE TABLE IF NOT EXISTS venta (
    id_venta            BIGSERIAL PRIMARY KEY,        
    num_venta           BIGINT NOT NULL,                
    fecha_reg           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hora_reg            TIME NOT NULL DEFAULT CURRENT_TIME,
    hora_cierre         TIMESTAMPTZ,                     
    cod_emp             BIGINT NOT NULL REFERENCES empleado(cod_emp) ON DELETE RESTRICT,  
    cod_emp2            BIGINT REFERENCES empleado(cod_emp) ON DELETE RESTRICT,             
    total_venta         NUMERIC(10,2) NOT NULL,
    id_mesa             INTEGER,
    id_seccion          BIGINT REFERENCES seccion(id_seccion) ON DELETE SET NULL,
    nit                 BIGINT DEFAULT -1,              
    impresiones_ticket  INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (id_mesa, id_seccion) REFERENCES mesa(id_mesa, id_seccion)
);

-- Pagos de una venta
CREATE TABLE IF NOT EXISTS pago (
    id_pago    BIGSERIAL PRIMARY KEY,
    id_venta   BIGINT NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
    id_metodo  BIGINT NOT NULL REFERENCES metodo_pago(id_metodo) ON DELETE RESTRICT,
    monto      NUMERIC(10,2) NOT NULL,
    fecha_reg  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Detalles de que se compro en una venta
CREATE TABLE IF NOT EXISTS detalles_venta (
    id_detalle_venta         BIGSERIAL PRIMARY KEY,
    id_venta                 BIGINT NOT NULL REFERENCES venta(id_venta) ON DELETE CASCADE,
    fecha_reg_detalle_venta  TIMESTAMPTZ NOT NULL DEFAULT NOW(),   
    id_prod                  BIGINT REFERENCES producto(id_prod) ON DELETE SET NULL,
    id_prom                  BIGINT REFERENCES promocion(id_prom) ON DELETE SET NULL,
    subtotal                 NUMERIC(10,2) NOT NULL,
    cantidad_prod_det        INTEGER NOT NULL,
    tipo_consumo             VARCHAR(20) NOT NULL,        
    estado_detalle_venta     VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',  
    marcado                  BOOLEAN NOT NULL DEFAULT FALSE,
    cantidad_marcado         INTEGER NOT NULL DEFAULT 0,
    id_mesero_actual         BIGINT NOT NULL REFERENCES empleado(cod_emp) ON DELETE RESTRICT
);

-- Ingredientes que el cliente pidió QUITAR de un producto normal
CREATE TABLE IF NOT EXISTS detalles_venta_exclusiones (
    id_exclusion       BIGSERIAL PRIMARY KEY,
    id_detalle_venta   BIGINT NOT NULL REFERENCES detalles_venta(id_detalle_venta) ON DELETE CASCADE,
    id_ing             BIGINT NOT NULL REFERENCES stock(id_ing) ON DELETE RESTRICT,
    nom_ing            VARCHAR(30) NOT NULL
);

-- Ingredientes que el cliente pidió QUITAR de un producto normal aplicados a una promocion
CREATE TABLE IF NOT EXISTS detalles_venta_exclusiones_promo (
    id_exclusion       BIGSERIAL PRIMARY KEY,
    id_detalle_venta   BIGINT NOT NULL REFERENCES detalles_venta(id_detalle_venta) ON DELETE CASCADE,
    id_prod            BIGINT NOT NULL REFERENCES producto(id_prod) ON DELETE CASCADE,
    id_ing             BIGINT NOT NULL REFERENCES stock(id_ing) ON DELETE RESTRICT,
    nom_ing            VARCHAR(30) NOT NULL,
    num_unidad         INTEGER NOT NULL DEFAULT 0
);

-- Ingredientes EXTRA que el cliente pidió agregar (con costo adicional)
CREATE TABLE IF NOT EXISTS detalles_venta_extras (
    id_extra           BIGSERIAL PRIMARY KEY,
    id_detalle_venta   BIGINT NOT NULL REFERENCES detalles_venta(id_detalle_venta) ON DELETE CASCADE,
    id_ing             BIGINT NOT NULL REFERENCES stock(id_ing) ON DELETE RESTRICT,
    nom_ing            VARCHAR(30) NOT NULL,
    cantidad_extra     NUMERIC(10,2) NOT NULL,
    precio_extra       NUMERIC(10,2) NOT NULL,
    id_prod            BIGINT REFERENCES producto(id_prod) ON DELETE SET NULL,   
    num_unidad         INTEGER                                                   
);

-- Unidades físicas de un pedido para marcar en pendientes de un pedido
CREATE TABLE IF NOT EXISTS detalles_venta_unidades (
    id_unidad          BIGSERIAL PRIMARY KEY,
    id_detalle_venta   BIGINT NOT NULL REFERENCES detalles_venta(id_detalle_venta) ON DELETE CASCADE,
    num_unidad         INTEGER NOT NULL,
    marcado            BOOLEAN NOT NULL DEFAULT FALSE,   
    id_prod            BIGINT REFERENCES producto(id_prod) ON DELETE SET NULL
);

-- Link editable hacia el sitio de impuestos nacionales
CREATE TABLE IF NOT EXISTS enlace (
    id_enlace  BIGSERIAL PRIMARY KEY,
    enlace     VARCHAR(200) NOT NULL DEFAULT 'https://siat.impuestos.gob.bo/v2/launcher/'
);

-- Codigos de validacion para reestablecer contraseñas
CREATE TABLE IF NOT EXISTS password_reset_codes (
    id_reset     BIGSERIAL PRIMARY KEY,
    cod_emp      BIGINT NOT NULL REFERENCES empleado(cod_emp) ON DELETE CASCADE,
    code         VARCHAR(6) NOT NULL,
    expires_at   TIMESTAMPTZ NOT NULL,
    used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Control de numero de ventas para varios usuarios
CREATE TABLE IF NOT EXISTS venta_daily_counter (
    fecha           DATE PRIMARY KEY,
    ultimo_numero   INTEGER NOT NULL DEFAULT 0
);

-- Configuración del reporte automático semanal por correo
CREATE TABLE IF NOT EXISTS scheduled_report_config (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(200),
    dia_semana    SMALLINT CHECK (dia_semana BETWEEN 0 AND 6),
    hora          TIME,
    ultimo_envio  DATE
);


-- Permite que cod_emp2 quede vacío cuando cobra DIRECTORIO
ALTER TABLE venta ALTER COLUMN cod_emp2 DROP NOT NULL;

-- Guarda las impresoras utilizadas para tickets y cocina
CREATE TABLE IF NOT EXISTS printer_config (
    id              BIGSERIAL PRIMARY KEY,
    ticket_printer  VARCHAR(200),
    cocina_printer  VARCHAR(200)
);

-- Guarda las credenciales de Brevo para el envío de correos
CREATE TABLE IF NOT EXISTS system_config (
    id                  BIGSERIAL PRIMARY KEY,
    brevo_api_key       VARCHAR(300),
    brevo_sender_email  VARCHAR(200),
    brevo_sender_name   VARCHAR(200)
);
