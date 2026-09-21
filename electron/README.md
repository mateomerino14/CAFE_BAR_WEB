# Cafebar — Electron (app de escritorio)

Este es el punto de entrada real de la aplicación que usa el cliente final — arranca la base de datos, el backend, y la ventana, todo en un solo paso.

## Qué hace `main.js`, en orden

1. Desactiva la aceleración por GPU (mitigación de un problema conocido de Electron/Windows: el proceso de GPU puede caerse al salir del modo reposo y recargar la ventana sola, perdiendo datos sin guardar).
2. Genera (la primera vez) o carga una clave secreta (`JWT_SECRET`) guardada en la carpeta de datos del usuario.
3. Arranca el Postgres embebido (`postgres-embebido.js`) — lo crea desde cero si es la primera vez que corre en esa PC.
4. Si es la primera vez, corre las migraciones (`migrate.js`): los 6 scripts SQL de `database/`, en orden, y crea el usuario DIRECTORIO con una contraseña por defecto.
5. Arranca el backend (`backend/index.js`, importado directo — no como proceso aparte) en `http://localhost:3000`.
6. Abre la ventana, cargando el frontend ya compilado (`frontend/dist/index.html`).

## Arrancar en desarrollo

```bash
npm install
npm start
```

Necesita que `frontend/` esté compilado (`npm run build` dentro de esa carpeta) — o, si el servidor de desarrollo de Vite (`npm run dev` en `frontend/`) está corriendo en paralelo, `main.js` detecta que no está empaquetado (`app.isPackaged` es falso) y carga `http://localhost:5173` en su lugar, mostrando cambios en caliente.

## Dónde vive cada cosa en la PC del cliente, una vez instalado

Todo lo generado por la app (base de datos, imágenes subidas, configuración) vive dentro de la carpeta de datos de la aplicación de Windows:
```
%APPDATA%\cafebar-desktop\
├── postgres-data\      # Los datos reales de Postgres
├── uploads\             # Imágenes subidas (productos, empleados, categorías, etc.)
└── app-config.json      # La clave JWT_SECRET generada
```

## Generar el instalador para entregar al cliente

```bash
npm run build
```

Usa `electron-builder` (configurado en `package.json`, sección `"build"`) para empaquetar `backend/`, `frontend/dist/` y `database/` dentro de un instalador `.exe` de Windows (NSIS) — el cliente solo necesita ejecutarlo, sin instalar Node, PostgreSQL, ni nada por separado.

## Archivos de este folder

| Archivo | Qué hace |
|---|---|
| `main.js` | Punto de entrada, arranca todo en el orden descrito arriba |
| `postgres-embebido.js` | Inicia/detiene el Postgres embebido, detecta si es la primera vez |
| `migrate.js` | Corre los 6 scripts SQL de `database/` y crea el usuario DIRECTORIO |
