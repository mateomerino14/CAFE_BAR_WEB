========================================================
# Base de Datos — Cafebar (versión de escritorio)
========================================================
Scripts SQL que crean y dejan lista la base de datos del sistema desde cero, usando **Postgres embebido dentro de la propia aplicación de escritorio** (Electron) — ya no depende de Supabase ni de ningún servicio en la nube.

========================================================
## Cómo se ejecutan (automático, no manual)
========================================================
A diferencia de la versión web anterior (donde estos scripts se corrían a mano en el SQL Editor de Supabase), en la versión de escritorio **no hace falta correr nada manualmente**.

La primera vez que la aplicación arranca en una computadora nueva:

1. Electron detecta que todavía no existe una base de datos (revisa si la carpeta de datos ya existe).
2. Crea el Postgres embebido desde cero.
3. Corre los 6 archivos SQL de esta carpeta, en el orden correcto, automáticamente (ver `electron/migrate.js`).
4. Crea el usuario **DIRECTORIO** con una contraseña por defecto (`cafebar2026` — **cámbiala de inmediato** desde Configuración → Cambiar Contraseña del Directorio, apenas entres por primera vez).

Todo esto pasa en segundo plano, antes de que se abra la ventana del sistema — el dueño del negocio no tiene que hacer nada de esto manualmente.

========================================================
## Orden de ejecución (para referencia, o si necesitas correrlos a mano)
========================================================
Si alguna vez necesitas correr estos archivos manualmente (por ejemplo, para depurar un problema, o para preparar una base de datos aparte durante desarrollo), deben correrse en este orden exacto — no es alfabético, cada archivo depende del anterior:

| Orden | Archivo | Qué hace |
|---|---|---|
| 1 | `schema.sql` | Crea todas las tablas del sistema (productos, empleados, ventas, etc.) |
| 2 | `index.sql` | Crea los índices para que las búsquedas y filtros sean rápidos |
| 3 | `triggers.sql` | Crea las funciones automáticas (numeración de mesas, conteo de mesas por sección) |
| 4 | `permits.sql` | Deja documentada la seguridad a nivel de fila (RLS) — ver nota más abajo, en esta versión no cumple ninguna función práctica |
| 5 | `data population.sql` | Carga los datos iniciales necesarios para que el sistema arranque (menú, permisos, formas de pago, categorías base) y datos de prueba |
| 6 | `functions backups.sql` | Crea las funciones que usa la pantalla de Backup para exportar/importar la base en Excel, y la del correlativo diario de ventas |

Para correrlos a mano contra el Postgres embebido (con la app cerrada), puedes usar cualquier cliente de Postgres (como `psql` o DBeaver) conectándote a `localhost:5432`, usuario `postgres`, contraseña `postgres`, base `cafebar`.

========================================================
## Nota importante sobre `permits.sql` (RLS) en esta versión
========================================================
El backend de la versión de escritorio se conecta a Postgres como **superusuario** (`postgres`), y los superusuarios de Postgres **ignoran RLS por diseño** del propio motor de base de datos — así que activar RLS aquí no tiene ningún efecto práctico en esta versión (no rompe nada, simplemente queda inactivo).

La seguridad real del sistema vive 100% en el backend (autenticación por JWT + permisos por Cargo), igual que en la versión web. Este archivo se deja solo como referencia histórica de la estructura original pensada para Supabase, donde RLS sí cumplía una función real (protegiendo el acceso directo desde `anon`/`authenticated` vía la API de Supabase).

========================================================
## Después de correr todo (solo si lo hiciste manualmente)
========================================================
Si corriste estos scripts a mano en vez de dejar que Electron lo haga solo, el usuario **DIRECTORIO** no se crea con `data population.sql` (necesita una contraseña encriptada real). Créalo aparte, corriendo una sola vez:

```bash
cd backend
node src/scripts/seedDirectorio.js <tu-contraseña>
```

========================================================
## Nota sobre los datos de prueba
========================================================
`data population.sql` incluye 8 empleados de prueba (cargo "Mesero") con una contraseña de relleno que **no es funcional** — no vas a poder iniciar sesión con ellos tal cual. Si quieres probarlos, entra como DIRECTORIO y usa "Modificar Empleado" para resetearles la contraseña desde ahí (eso sí genera una contraseña real y utilizable).

========================================================
## Sobre `functions backups.sql`
========================================================
La función `admin_truncate_table` usa `DELETE ... WHERE true` (en vez de un `TRUNCATE` simple) — esto viene de un requisito específico de Supabase (una extensión llamada `safeupdate` que bloquea `DELETE`/`UPDATE` sin `WHERE`). El Postgres embebido de esta versión no tiene esa extensión activada, pero la sintaxis `WHERE true` sigue siendo válida y funciona igual de bien, así que no hace falta cambiar nada — se dejó tal cual para no arriesgar nada.

La restauración de un backup (`importDatabaseFromExcel` en el backend) corre **dentro de una transacción real** — si cualquier fila falla al reinsertarse, se deshace todo el proceso completo y la base queda exactamente como estaba antes de intentar restaurar, sin perder datos a medio camino.
