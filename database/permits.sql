-- =====================================================================
-- RLS = Row Level Security ("seguridad a nivel de fila" de Postgres).
-- =====================================================================

ALTER TABLE categoria                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategoria                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock                              ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_ingredientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seccion                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesa                               ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cliente                            ENABLE ROW LEVEL SECURITY; 
-- ALTER TABLE impresora                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantalla                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subpantalla                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo                              ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_cargo                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_cargo_subpantalla         ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado                           ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE permisos_personal                  ENABLE ROW LEVEL SECURITY; 
-- ALTER TABLE permisos_personal_subpantalla      ENABLE ROW LEVEL SECURITY; 
ALTER TABLE promocion                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocion_dias                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocion_prod                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE metodo_pago                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta                              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pago                               ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_venta                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_venta_exclusiones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_venta_exclusiones_promo   ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_venta_extras              ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_venta_unidades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE directorio                         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE cuenta                             ENABLE ROW LEVEL SECURITY;
ALTER TABLE enlace                             ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_codes               ENABLE ROW LEVEL SECURITY;
-- =====================================================================
-- NOTA (versión de escritorio): el backend se conecta a Postgres como
-- superusuario ("postgres"), y los superusuarios ignoran RLS por diseño
-- de PostgreSQL — por lo tanto, activar RLS aquí no tiene ningún efecto
-- práctico en esta versión (no rompe nada, simplemente queda inactivo).
-- La seguridad real sigue viviendo 100% en el backend (JWT + permisos
-- por Cargo), igual que en la versión web. Se deja este archivo solo
-- como referencia histórica de la estructura original.
-- =====================================================================
ALTER TABLE printer_config                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_daily_counter                ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_report_config            ENABLE ROW LEVEL SECURITY;
