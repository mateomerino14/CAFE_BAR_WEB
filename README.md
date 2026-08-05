# Cafebar — Sistema de Gestión para Restaurante

# Migración completa de un sistema de escritorio (Python + PyQt + SQLite) a una aplicación web moderna. Es un sistema **interno de gestión**, pensado para usarse dentro del local (Caja, cocina, administración) — no incluye pedidos de clientes a domicilio ni tienda online.

## Stack

**Backend:** Node.js + Express + Supabase (PostgreSQL)
**Frontend:** React + Vite + Tailwind CSS v4
**Autenticación:** JWT (8h de duración), bcrypt para contraseñas
**Correo:** Brevo (recuperación de contraseña, backups, reportes)
**Almacenamiento de imágenes:** Supabase Storage
=====================================================

## Estructura del repositorio

Monorepo con dos carpetas principales, cada una con su propio `package.json`:

```
CAFE_BAR_WEB/
├── backend/
│   └── src/
│       ├── config/          # Conexión a Supabase, configuración de multer (uploads)
│       ├── controllers/     # Reciben la request, validan input, llaman al service, responden
│       ├── services/        # Toda la lógica de negocio y las queries a Supabase
│       ├── routes/          # Definición de endpoints (mapean URL → controller)
│       ├── middlewares/     # authenticate (verifica JWT) y authorize (verifica permiso)
│       ├── utils/           # Funciones puras reutilizables (hash, tokens, validadores)
│       └── scripts/         # Scripts puntuales (ej. sembrar el usuario DIRECTORIO)
│
└── frontend/
    └── src/
        ├── components/
        │   ├── atoms/       # Piezas mínimas (Button, TextInput, Modal, Checkbox...)
        │   ├── molecules/   # Combinaciones simples (FormField, SearchBar, Pagination...)
        │   ├── organisms/   # Piezas complejas con lógica propia (modales, tablas, carritos)
        │   └── templates/   # Layout general de página (MainLayout: header + nav + footer)
        ├── features/        # Un folder por módulo de negocio (ver abajo), cada uno con:
        │   └── <modulo>/
        │       ├── pages/       # Las pantallas completas que se enrutan
        │       ├── hooks/       # Toda la lógica de estado del módulo (custom hooks)
        │       ├── services/    # Llamadas a la API específicas del módulo
        │       └── utils/       # Utilidades puntuales del módulo (ej. formato de ticket)
        ├── context/         # AuthContext (sesión, permisos)
        ├── hooks/           # Hooks genéricos compartidos (usePagination, useDisclosure...)
        ├── router/          # AppRouter + ProtectedRoute (control de acceso por permiso)
        ├── constants/       # theme.js (colores), navigation.js (menú)
        └── lib/             # Cliente axios (api.js) con interceptores de auth
```

=====================================================

## Arquitectura: reglas del proyecto

1. **Atomic Design en el frontend.** Toda la lógica vive en hooks (`features/<modulo>/hooks`), nunca directo en los componentes de página. Los componentes solo renderizan y llaman a lo que el hook les da.
2. **Estilos con objeto `styles`.** Cada componente define un `const styles = {...}` con clases de Tailwind, en vez de escribir clases inline repetidas.
3. **Paginación consistente.** Todas las listas/tablas usan el hook `usePagination` + el componente `Pagination` compartido.
4. **Selects con búsqueda.** Nunca `<select>` nativo — siempre `SearchableSelect`, para mantener el mismo look en todo el sistema.
5. **Toasts fuera del layout.** Cualquier `<Toast>` debe renderizarse como hermano de `<MainLayout>` (fuera de él), nunca adentro — el `<main>` tiene una animación con `transform` que rompe el posicionamiento `fixed` si el Toast queda anidado dentro.
6. **Backend: controller → service → Supabase.** Los controllers nunca hablan directo con la base — siempre a través de un service. Las validaciones de entrada van en el controller; la lógica de negocio, en el service.
7. **Rutas protegidas por permiso.** Cada ruta del backend usa `authorize('NOMBRE_PERMISO')`, y cada ruta del frontend usa `<ProtectedRoute permission="NOMBRE_PERMISO">`. Los permisos de empleados vienen de su Cargo; el usuario DIRECTORIO tiene una lista fija de permisos hardcodeada en `authService.js`.
8. # **N+1 nunca.** Cuando una pantalla necesita datos relacionados de muchos registros a la vez (ej. exclusiones/extras de cada producto de una venta), se trae todo en pocas consultas (`.in(...)`) y se arma la relación en memoria con `Map`, en vez de una consulta por registro.

## Reglas de negocio clave

- **Una venta tiene solo 2 estados reales:** `PENDIENTE` (en preparación) o `Finalizado` — el cobro finaliza todos los detalles de una venta a la vez, de forma atómica. No existen estados parciales.
- **El stock nunca bloquea una venta.** Si no alcanza, se descuenta hasta 0 (nunca negativo) pero la venta se registra igual — evita que un stock desactualizado le cueste una venta real al negocio.
- **No se puede cobrar una mesa con unidades sin marcar como listas en cocina.**
- **Control de impresión:** máximo 2 impresiones gratis por venta (ticket y cocina por separado); a la tercera pide la contraseña del usuario actual.
- **El N° de venta se reinicia cada día** (calculado en huso horario de Bolivia, UTC-4 fijo, sin depender de la configuración del servidor).
- # **Personalización de productos y promociones:** excluir un ingrediente nunca reduce el precio; agregar un extra sí lo suma. Se puede dividir una cantidad en sub-grupos con distinta personalización cada uno (ej. 2 hamburguesas: 1 sin cebolla, 1 normal).

## Módulos del sistema

| Módulo                 | Qué hace                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth                   | Login (empleados + DIRECTORIO), recuperación de contraseña por correo                                                                               |
| Empleados / Cargos     | Registro, modificación, permisos por cargo, dar de baja                                                                                             |
| Categorías / Productos | CRUD completo, con ingredientes y recetas                                                                                                           |
| Stock                  | Ingredientes y su cantidad disponible                                                                                                               |
| Secciones / Mesas      | Administración del salón                                                                                                                            |
| Promociones            | Combos con horarios de disponibilidad configurables                                                                                                 |
| Familia                | Catálogo explorador de productos y promociones                                                                                                      |
| Caja (POS)             | Flujo completo: mesa → armar pedido → cocina → cobro, con impresión térmica vía navegador                                                           |
| Configuración          | Enlace de impuestos, contraseña del DIRECTORIO, ventas diarias, backup (exportar/importar Excel, envío por correo), eliminación física de registros |
| Reportes               | Ventas detalladas, resumen por fechas, productos más vendidos, resumen por empleado (gráficos)                                                      |

=====================================================

## Puesta en marcha (desarrollo local)

=====================================================

### Backend

```bash
cd backend
npm install
# Crea backend/.env a partir de backend/.env.example y completa tus credenciales
npm run dev
```

=====================================================

### Frontend

```bash
cd frontend
npm install
# Crea frontend/.env con VITE_API_URL apuntando a tu backend
npm run dev
```

=====================================================

## Variables de entorno necesarias

**`backend/.env`:**

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
```

**`frontend/.env`:**

```
VITE_API_URL=
```

=====================================================

## Impresión de tickets

No requiere ninguna impresora configurada en el sistema ni en la base de datos. El ticket/comanda se genera como texto plano monoespaciado (formato de impresora térmica de 44 caracteres) y se imprime abriendo el diálogo nativo de impresión del navegador — ahí se elige la impresora física instalada en el sistema operativo.

=====================================================

## Despliegue

Actualmente conectado a Supabase Cloud. Está planificada una migración a **Supabase auto-alojado** (Docker) corriendo en la misma PC que se use como Caja del local, para que el sistema siga funcionando aunque se corte el internet — sin necesidad de cambiar código, solo la URL de conexión.
