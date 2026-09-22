# Cafebar — Frontend

Aplicación React (Vite + Tailwind CSS v4) del sistema de gestión Cafebar. Ver el README principal en la raíz del repositorio para la descripción completa del proyecto.

En producción, esta app **no se sirve en ningún navegador ni se despliega a ningún hosting** — se compila a estático (`npm run build`) y Electron la carga directamente dentro de la ventana de escritorio.

## Arrancar en desarrollo

```bash
npm install
npm run dev
```

Esto levanta el servidor de desarrollo de Vite en `http://localhost:5173` — cuando corres Electron en modo desarrollo (`npm start` dentro de `electron/`, sin haber compilado antes), es a esta dirección a la que se conecta.

Usa `.env` (basado en `.env.example`):
```
VITE_API_URL=http://localhost:3000/api
```
Esta es la dirección fija del backend, que siempre corre local en el puerto 3000 (arrancado por Electron). No hace falta cambiar este valor salvo que también cambies el puerto del backend.

## Documentación de componentes (Storybook)

```bash
npm run storybook
```

Abre `http://localhost:6006` — documentación interactiva de los átomos (`src/stories/atoms/`) y moléculas (`src/stories/molecules/`) del sistema.

## Estructura

- `src/components/` — atoms, molecules, organisms, templates (Atomic Design)
- `src/features/` — un folder por módulo de negocio (pages, hooks, services, utils)
- `src/stories/` — documentación de componentes con Storybook
- `src/context/`, `src/hooks/`, `src/router/`, `src/lib/` — utilidades compartidas

## Build de producción

```bash
npm run build
```

Genera la carpeta `dist/` — **este es el paso que Electron necesita** para mostrar la versión más reciente del sistema. Cada vez que cambies algo en `frontend/`, hay que volver a correr este comando antes de abrir Electron, o va a seguir mostrando la versión vieja compilada.

## Dos configuraciones obligatorias para que funcione dentro de Electron

Electron carga este `dist/index.html` como archivo local (`file://`), no desde un servidor real — eso rompe dos cosas que funcionan bien en cualquier navegador normal, así que están corregidas a propósito en el código y **no deben revertirse**:

1. **`base: './'` en `vite.config.js`** — sin esto, el build genera rutas absolutas (`/assets/...`) que apuntan a la raíz del disco en vez de a la carpeta real de los archivos, y la app carga completamente en blanco (sin ningún error visible, solo en la consola de DevTools).
2. **`HashRouter`, no `BrowserRouter`, en `src/main.jsx`** — `BrowserRouter` necesita un servidor capaz de resolver cualquier ruta; cargado como archivo local, no puede, y cualquier pantalla cae siempre en la página de "no existe" (404). `HashRouter` (rutas tipo `#/login`) funciona sin ese problema.
