# Cafebar — Sistema de Gestión para Restaurante

Migración completa de un sistema de escritorio (Python + PyQt + SQLite) a una aplicación web moderna. Es un sistema **interno de gestión**, pensado para usarse dentro del local (Caja, cocina, administración) — no incluye pedidos de clientes a domicilio ni tienda online.

## Stack

**Backend:** Node.js + Express + Supabase (PostgreSQL)
**Frontend:** React + Vite + Tailwind CSS v4
**Autenticación:** JWT (8h de duración), bcrypt para contraseñas
**Correo:** Brevo (recuperación de contraseña, backups, reportes)
**Almacenamiento de imágenes:** Supabase Storage
**Impresión:** Servicio local (`print-agent`) para impresoras térmicas, con respaldo de diálogo del navegador y descarga PDF en móvil
**Documentación de componentes:** Storybook (átomos y moléculas)

---

## Estructura del repositorio

Monorepo con varias piezas independientes, cada una con su propio `package.json`:

```
CAFE_BAR_WEB/
├── backend/         # API REST en Node.js + Express (se despliega a Render)
│   └── src/
│       ├── config/          # Conexión a Supabase, configuración de multer (uploads)
│       ├── controllers/     # Reciben la request, validan input, llaman al service, responden
│       ├── services/        # Toda la lógica de negocio y las queries a Supabase
│       ├── routes/          # Definición de endpoints (mapean URL → controller)
│       ├── middlewares/     # authenticate, authorize, restrictByIp
│       ├── utils/           # Funciones puras reutilizables (hash, tokens, validadores)
│       └── scripts/         # Scripts puntuales (ej. sembrar el usuario DIRECTORIO)
│
├── frontend/         # Aplicación React servida con Vite (se despliega a Vercel)
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
├── database/         # Scripts SQL: schema, índices, triggers, permisos, datos
│
└── print-agent/       # Servicio local de impresión — corre solo en la PC de Caja, nunca se despliega
```

---

## Arquitectura: reglas del proyecto

1. **Atomic Design en el frontend.** Toda la lógica vive en hooks (`features/<modulo>/hooks`), nunca directo en los componentes de página.
2. **Estilos con objeto `styles`.** Cada componente define un `const styles = {...}` con clases de Tailwind.
3. **Paginación consistente.** Todas las listas/tablas usan `usePagination` + `Pagination`.
4. **Selects con búsqueda.** Nunca `<select>` nativo — siempre `SearchableSelect`.
5. **Toasts fuera del layout.** Cualquier `<Toast>` debe renderizarse como hermano de `<MainLayout>` (fuera de él), nunca adentro — el `<main>` tiene una animación con `transform` que rompe el posicionamiento `fixed` si el Toast queda anidado dentro.
6. **Backend: controller → service → Supabase.** Los controllers nunca hablan directo con la base — siempre a través de un service.
7. **Rutas protegidas por permiso.** Cada ruta del backend usa `authorize('NOMBRE_PERMISO')`, y cada ruta del frontend usa `<ProtectedRoute permission="NOMBRE_PERMISO">`.
8. **N+1 nunca.** Se trae todo en pocas consultas (`.in(...)`) y se arma la relación en memoria con `Map`.
9. **Operaciones concurrentes de forma atómica.** El número de venta diario y la reserva de mesa usan operaciones atómicas de PostgreSQL (`ON CONFLICT DO UPDATE` y `UPDATE ... WHERE disponible = true`) para que dos empleados trabajando al mismo tiempo nunca generen números de venta duplicados ni ocupen la misma mesa dos veces.
10. **Comentarios en cada método del backend.** Todos los métodos exportados de `controllers/`, `services/`, `routes/` y `utils/` incluyen un comentario breve explicando su propósito.

## Reglas de negocio clave

- **Una venta tiene solo 2 estados reales:** `PENDIENTE` (en preparación) o `Finalizado`.
- **El stock nunca bloquea una venta.** Si no alcanza, se descuenta hasta 0 (nunca negativo) pero la venta se registra igual.
- **No se puede cobrar una mesa con unidades sin marcar como listas en cocina.**
- **Control de impresión:** máximo 2 impresiones gratis por venta (ticket y cocina por separado); a la tercera pide la contraseña del usuario actual. La descarga de PDF (respaldo en móvil) no cuenta para este límite.
- **El N° de venta se reinicia cada día** (calculado en huso horario de Bolivia, UTC-4 fijo).
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
| Familia                | Catálogo explorador de productos y promociones                                                                                               |
| Caja (POS)             | Flujo completo: mesa → armar pedido → cocina → cobro, con impresión térmica vía print-agent (con respaldo de navegador/PDF)                  |
| Configuración          | Enlace de impuestos, contraseña del DIRECTORIO, ventas diarias, backup, eliminación física, configuración de impresoras                      |
| Reportes               | Ventas detalladas, resumen por fechas, productos/promociones con ganancia real, resumen por empleado (gráficos)                              |

---

## Puesta en marcha (desarrollo local)

### Backend
```bash
cd backend
npm install
# Crea backend/.env a partir de backend/.env.example y completa tus credenciales
npm run dev
```

### Frontend
```bash
cd frontend
npm install
# Crea frontend/.env con VITE_API_URL apuntando a tu backend
npm run dev
```

### Documentación de componentes (Storybook)
```bash
cd frontend
npm run storybook
```
Abre `http://localhost:6006` con la documentación interactiva de los átomos y moléculas del sistema.

### Servicio de impresión (print-agent)
```bash
cd print-agent
npm install
npm start
```
Ver `print-agent/README.md` para la configuración de arranque automático e invisible.

---

## Variables de entorno necesarias

**`backend/.env`:**
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
ALLOWED_IPS=
```

**`frontend/.env`:**
```
VITE_API_URL=
```

---

## Impresión de tickets

El sistema intenta primero el servicio local `print-agent` (impresión directa, sin diálogos, con impresoras fijas para Ticket/Cocina configurables desde el sistema). Si no está disponible, en PC/laptop cae al diálogo de impresión del navegador; en móvil, ofrece descargar el ticket como PDF con el ancho exacto del rollo térmico (80mm).

---

## Despliegue

Backend en Render, Frontend en Vercel, Base de datos en Supabase Cloud. Dominio propio conectado (`incantatio.org`). Como alternativa, está documentada la migración a Supabase auto-alojado (Docker) en una PC del local, para operar sin depender de internet.