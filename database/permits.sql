-- =====================================================================
-- RLS = Row Level Security
-- =====================================================================

-- Habilita RLS en las tablas del sistema
ALTER TABLE categoria                          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategoria                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock                              ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos_ingredientes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE seccion                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesa                               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantalla                           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subpantalla                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo                              ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_cargo                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE permisos_cargo_subpantalla         ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleado                           ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE enlace                             ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_codes               ENABLE ROW LEVEL SECURITY;

-- En escritorio, RLS queda inactivo al usar el usuario postgres, ya que la seguridad está en el backend
ALTER TABLE printer_config                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE venta_daily_counter                ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_report_config            ENABLE ROW LEVEL SECURITY;
