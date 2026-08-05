========================================================
# Base de Datos — Cafebar
========================================================
Scripts SQL para crear y dejar lista la base de datos del sistema desde cero en Supabase (PostgreSQL).

========================================================
## Orden de ejecución
========================================================
**Importante:** estos archivos deben correrse en este orden exacto, uno por uno. No es un orden alfabético — cada archivo depende de que el anterior ya se haya ejecutado (por ejemplo, no se pueden crear índices sobre tablas que todavía no existen).

| Orden | Archivo | Qué hace |
|---|---|---|
| 1 | `schema.sql` | Crea todas las tablas del sistema (productos, empleados, ventas, etc.) |
| 2 | `index.sql` | Crea los índices para que las búsquedas y filtros sean rápidos |
| 3 | `triggers.sql` | Crea las funciones automáticas (numeración de mesas, conteo de mesas por sección) |
| 4 | `permits.sql` | Activa la seguridad a nivel de fila (RLS), bloqueando el acceso directo a la base |
| 5 | `data population.sql` | Carga los datos iniciales necesarios para que el sistema arranque (menú, permisos, formas de pago, categorías base) y datos de prueba |
| 6 | `functions backups.sql` | Crea las funciones que usa la pantalla de Backup para exportar/importar la base en Excel |

========================================================
## Cómo correrlos
========================================================
1. Entra a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor**.
2. Abre `schema.sql` en tu editor de código, copia todo el contenido, pégalo en el SQL Editor de Supabase y dale **Run**.
3. Repite el mismo paso con cada archivo siguiente, **respetando el orden de la tabla de arriba**.

Todos los scripts están escritos para poder correrse más de una vez sin romper nada ni duplicar datos (usan `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, etc.) — así que si algo falla a la mitad, puedes corregirlo y volver a correr el mismo archivo sin miedo.

========================================================
## Después de correr todo
========================================================
El usuario administrador (**DIRECTORIO**) no se crea con estos scripts, porque necesita una contraseña encriptada real. Se crea aparte, corriendo una sola vez:

```bash
cd backend
node src/scripts/seedDirectorio.js
```

Con eso, la base queda lista para que el backend se conecte y el sistema funcione de punta a punta.

========================================================
## Nota sobre los datos de prueba
========================================================
`data population.sql` incluye 8 empleados de prueba (cargo "Mesero") con una contraseña de relleno que **no es funcional** — no vas a poder iniciar sesión con ellos tal cual. Si quieres probarlos, entra como DIRECTORIO y usa "Modificar Empleado" para resetearles la contraseña desde ahí (eso sí genera una contraseña real y utilizable).

========================================================
## Nota sobre `functions backups.sql` (importante si ya lo corriste antes)
========================================================
Supabase tiene activada por defecto una extensión de Postgres (`safeupdate`) que bloquea cualquier `DELETE`/`UPDATE` que no lleve una cláusula `WHERE`, incluso dentro de una función con permisos elevados (`SECURITY DEFINER`). La función `admin_truncate_table` fue corregida agregando `WHERE true` al `DELETE` (sigue borrando todas las filas igual, solo cumple el requisito sintáctico).

Si ya habías corrido una versión anterior de este archivo en tu proyecto de Supabase, **vuelve a correr `functions backups.sql` completo** para aplicar la corrección — de lo contrario, la importación de backups desde Excel va a fallar con el error `DELETE requires a WHERE clause`.

========================================================
## Tablas que existen en el código pero están comentadas
========================================================

Dentro de `schema.sql` hay 4 tablas dejadas intencionalmente comentadas (dentro de bloques `/* */`). No es un error ni algo que falte crear — nunca se conectaron al resto del sistema y quedaron documentadas ahí solo como referencia histórica, por si en el futuro se retoman:

| `cliente`   | Pensada para facturación por NIT en el sistema original, nunca se conectó al flujo real de ventas. |
| `impresora` | En la versión de escritorio hacía falta configurar la impresora en la base. En la web, el navegador maneja la impresión directamente — ya no hace falta. |
| `permisos_personal` / `permisos_personal_subpantalla` | El sistema de permisos terminó manejándose solo por Cargo, nunca por empleado individual. |
| `cuenta`    | Guardaba cuentas Gmail con contraseña de aplicación para enviar backups por correo. Se reemplazó por Brevo (más seguro, sin necesidad de administrar cuentas). |
