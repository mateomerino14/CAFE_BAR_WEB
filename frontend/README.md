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
