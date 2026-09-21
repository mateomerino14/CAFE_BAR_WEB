# Cafebar — Sistema de Gestión para Restaurante

Aplicación de escritorio (Windows) para gestión interna de un restaurante/bar — Caja, cocina, administración. No incluye pedidos de clientes a domicilio ni tienda online. Corre 100% local en la PC del negocio, sin necesitar internet para funcionar día a día.

Originalmente fue un sistema de escritorio en Python + PyQt + SQLite, después se migró a una aplicación web (React + Node + Supabase Cloud), y finalmente se convirtió en esta app de escritorio con Electron — conservando todas las funciones nuevas que se sumaron en el camino (reportes con gráficos, promociones con horarios, backups, etc.), pero sin depender de ningún servicio en la nube para operar.

## Stack

**Backend:** Node.js + Express + PostgreSQL (embebido dentro de la propia app, vía `embedded-postgres`)
**Frontend:** React + Vite + Tailwind CSS v4, empaquetado y servido dentro de Electron
**Empaquetado de escritorio:** Electron (arranca la base de datos embebida, el backend, y la ventana, todo junto)
**Autenticación:** JWT (8h de duración), bcrypt para contraseñas
**Correo:** Brevo (recuperación de contraseña, backups, reportes) — la API Key se configura desde la propia app, no por variable de entorno
**Almacenamiento de imágenes:** Archivos locales en la carpeta de datos de la app (ya no usa ningún servicio en la nube)
**Impresión:** Directo desde el backend a las impresoras de Windows vía PowerShell — sin certificados, sin servicio aparte, sin configurar ninguna IP
**Documentación de componentes:** Storybook (átomos y moléculas)

---

## Estructura del repositorio

Monorepo con varias piezas independientes, cada una con su propio `package.json`:

```
CAFE_BAR_WEB/
├── electron/         # Punto de entrada de la app de escritorio
│   ├── main.js              # Arranca Postgres embebido, el backend, y la ventana
│   ├── postgres-embebido.js # Maneja el ciclo de vida del Postgres embebido
│   └── migrate.js           # Corre los scripts SQL la primera vez que arranca
│
├── backend/          # API REST en Node.js + Express (corre embebido dentro de Electron)
│   └── src/
│       ├── config/          # Conexión a Postgres (pg), configuración de multer (uploads)
│       ├── controllers/     # Reciben la request, validan input, llaman al service, responden
│       ├── services/        # Toda la lógica de negocio y las queries SQL directas
│       ├── routes/          # Definición de endpoints (mapean URL → controller)
│       ├── middlewares/     # authenticate, authorize, restrictByIp
│       ├── utils/           # Funciones puras reutilizables (hash, tokens, validadores, impresoras)
│       └── scripts/         # Scripts puntuales (ej. sembrar el usuario DIRECTORIO a mano)
│
├── frontend/         # Aplicación React, se compila a estático y Electron la carga
│   └── src/
│       ├── components/
│       │   ├── atoms/       # Piezas mínimas (Button, TextInput, Modal, Checkbox...)
│       │   ├── molecules/   # Combinaciones simples (FormField, SearchableSelect, Pagination...)
│       │   ├── organisms/   # Piezas complejas con lógica propia (modales, tablas, carritos)
│       │   └── templates/   # Layout general de página (MainLayout: header + nav + footer)
│       ├── stories/         # Documentación de componentes con Storybook (atoms/, molecules/)
│       ├── features/        # Un folder por módulo de negocio, cada uno con pages/hooks/services/utils
│       ├── context/         # AuthContext (sesión, permisos)
│       ├── hooks/           # Hooks genéricos compartidos (usePagination, useDisclosure...)
│       ├── router/          # AppRouter + ProtectedRoute (control de acceso por permiso)
│       ├── constants/       # theme.js (colores), navigation.js (menú)
│       └── lib/              # Cliente axios (api.js) con interceptores de auth
│
└── database/         # Scripts SQL: schema, índices, triggers, permisos, datos (se corren solos al arrancar por primera vez)
```

---

## Arquitectura: reglas del proyecto

1. **Atomic Design en el frontend.** Toda la lógica vive en hooks (`features/<modulo>/hooks`), nunca directo en los componentes de página.
2. **Estilos con objeto `styles`.** Cada componente define un `const styles = {...}` con clases de Tailwind.
3. **Paginación consistente.** Todas las listas/tablas usan `usePagination` + `Pagination`.
4. **Selects con búsqueda.** Nunca `<select>` nativo — siempre `SearchableSelect`.
5. **Toasts fuera del layout.** Cualquier `<Toast>` debe renderizarse como hermano de `<MainLayout>` (fuera de él), nunca adentro — el `<main>` tiene una animación con `transform` que rompe el posicionamiento `fixed` si el Toast queda anidado dentro.
6. **Backend: controller → service → Postgres directo.** Los controllers nunca escriben SQL directo — siempre a través de un service, usando `query()` (`pg`) con consultas parametrizadas.
7. **Rutas protegidas por permiso.** Cada ruta del backend usa `authorize('NOMBRE_PERMISO')` (acepta un permiso o una lista), y cada ruta del frontend usa `<ProtectedRoute permission="NOMBRE_PERMISO">`.
8. **N+1 nunca.** Se trae todo en pocas consultas (`= ANY($1::bigint[])`) y se arma la relación en memoria con `Map`.
9. **Operaciones concurrentes de forma atómica.** El número de venta diario y la reserva de mesa usan operaciones atómicas de PostgreSQL (`ON CONFLICT DO UPDATE` y `UPDATE ... WHERE disponible = true`) para que dos empleados trabajando al mismo tiempo nunca generen números de venta duplicados ni ocupen la misma mesa dos veces.
10. **Comentarios en cada método del backend.** Todos los métodos exportados de `controllers/`, `services/`, `routes/` y `utils/` incluyen un comentario breve explicando su propósito.
11. **Cuidado con lo que devuelve `pg`.** A diferencia de Supabase, `pg` devuelve columnas `BIGINT` como texto (no número) y columnas `TIMESTAMPTZ`/`DATE` como objetos `Date` de JavaScript (no texto) — hay que convertir explícitamente al comparar IDs o usar fechas como clave de agrupación, o se generan bugs silenciosos difíciles de notar.

## Reglas de negocio clave

- **Una venta tiene solo 2 estados reales:** `PENDIENTE` (en preparación) o `Finalizado`.
- **El stock nunca bloquea una venta.** Si no alcanza, se descuenta hasta 0 (nunca negativo) pero la venta se registra igual.
- **No se puede cobrar una mesa con unidades sin marcar como listas en cocina.**
- **El monto pagado debe coincidir exactamente con el total** (con un margen mínimo solo para errores de redondeo de punto flotante, no para diferencias reales de centavos).
- **Control de impresión:** máximo 2 impresiones gratis por venta (ticket y cocina por separado); a la tercera pide la contraseña del usuario actual. La descarga de PDF (respaldo en móvil) no cuenta para este límite.
- **El N° de venta se reinicia cada día** (calculado en huso horario de Bolivia, UTC-4 fijo) — pueden aparecer saltos en la numeración si una venta se cancela o falla a medio registrar; es comportamiento normal, no un bug.
- **Personalización de productos y promociones:** excluir un ingrediente nunca reduce el precio; agregar un extra sí lo suma.

## Módulos del sistema

| Módulo                 | Qué hace                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth                   | Login (empleados + DIRECTORIO), recuperación de contraseña por correo                                                                       |
| Empleados / Cargos     | Registro, modificación, permisos por cargo, dar de baja                                                                                      |
| Categorías / Productos | CRUD completo, con ingredientes y recetas                                                                                                    |
| Stock                  | Ingredientes y su cantidad disponible                                                                                                        |
| Secciones / Mesas      | Administración del salón                                                                                                                     |
| Promociones            | Combos con horarios de disponibilidad configurables                                                                                          |
| Familia                | Catálogo explorador de productos y promociones, con estimado de cuánto se puede fabricar según el stock actual                              |
| Caja (POS)             | Flujo completo: mesa → armar pedido → cocina → cobro, con impresión térmica directa desde el backend                                        |
| Configuración          | Enlace de impuestos, contraseña del DIRECTORIO, ventas diarias, backup, eliminación física, configuración de impresoras, envío de correos, reporte automático semanal |
| Reportes               | Ventas detalladas, resumen por fechas, productos/promociones con ganancia real, resumen por empleado (gráficos)                              |

---

## Puesta en marcha (desarrollo local)

### 1. Backend
```bash
cd backend
npm install
```

### 2. Frontend
```bash
cd frontend
npm install
npm run build
```

### 3. Electron (arranca todo: base de datos, backend y ventana)
```bash
cd electron
npm install
npm start
```

La primera vez que arranca en una PC nueva, crea el Postgres embebido, corre las migraciones de `database/` automáticamente, y crea el usuario DIRECTORIO con contraseña por defecto `cafebar2026` (cámbiala de inmediato desde Configuración).

### Documentación de componentes (Storybook)
```bash
cd frontend
npm run storybook
```
Abre `http://localhost:6006` con la documentación interactiva de los átomos y moléculas del sistema.

---

## Variables de entorno

**Para uso normal (Electron), no hace falta configurar nada.** Electron genera y gestiona automáticamente lo necesario (clave JWT, rutas de la base de datos y de imágenes) la primera vez que arranca.

Las credenciales de Brevo (envío de correos) **no van en un archivo `.env`** — se configuran desde dentro de la propia app, en Configuración → Configurar Envío de Correos, y quedan guardadas en la base de datos (así se pueden cambiar sin reiniciar nada).

`backend/.env` solo hace falta si vas a correr el backend **manualmente**, fuera de Electron (por ejemplo, para probar algo puntual con `node index.js` contra un Postgres propio). Ver `backend/.env.example` para las variables disponibles en ese caso.

---

## Impresión de tickets

El backend imprime directo a las impresoras de Windows usando PowerShell (`Get-Printer` / `Out-Printer`), sin ningún servicio aparte, certificado, ni dirección IP que configurar — funciona con cualquier impresora que tenga su driver instalado en Windows, incluidas térmicas. Se configuran una sola vez desde Configuración → Configurar Impresoras (cuál usar para Ticket, cuál para Cocina). Si por algún motivo la impresión directa falla, cae a un diálogo de impresión de respaldo.

---

## Distribución a los clientes

Para generar el instalador que se le entrega al dueño del negocio:

```bash
cd electron
npm run build
```

Esto usa `electron-builder` (configurado en `electron/package.json`) para empaquetar todo (backend, frontend compilado, y los scripts de base de datos) en un instalador `.exe` para Windows, sin que el cliente necesite instalar Node, PostgreSQL, ni nada por separado — todo queda contenido dentro del instalador.

Ver `database/READMI.md` para más detalle sobre cómo se inicializa la base de datos la primera vez.
