# Cafebar — Frontend

Aplicación React (Vite + Tailwind CSS v4) del sistema de gestión Cafebar. Ver el README principal en la raíz del repositorio para la descripción completa del proyecto.

## Arrancar en desarrollo

```bash
npm install
npm run dev
```

Crea un archivo `.env` con:
```
VITE_API_URL=http://localhost:3000/api
```
(o la URL de tu backend desplegado)

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