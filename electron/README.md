# Cafebar — Electron (app de escritorio)

Este es el punto de entrada real de la aplicación que usa el cliente final — arranca la base de datos, el backend, y la ventana, todo en un solo paso.

## Qué hace `main.js`, en orden

1. Desactiva la aceleración por GPU (mitigación de un problema conocido de Electron/Windows: el proceso de GPU puede caerse al salir del modo reposo y recargar la ventana sola, perdiendo datos sin guardar).
2. Genera (la primera vez) o carga una clave secreta (`JWT_SECRET`) guardada en la carpeta de datos del usuario.
3. Arranca el Postgres embebido (`postgres-embebido.js`) — lo crea desde cero si es la primera vez que corre en esa PC.
4. Si es la primera vez, corre las migraciones (`migrate.js`): los 6 scripts SQL de `database/`, en orden, y crea el usuario DIRECTORIO con una contraseña por defecto. **Los datos de prueba (empleados falsos, categorías de ejemplo) nunca se crean automáticamente** — viven aparte en `database/datos de prueba (opcional).sql`, fuera de esta lista.
5. Arranca el backend (`backend/index.js`, importado directo — no como proceso aparte) en `http://localhost:3000`.
6. Abre la ventana, cargando el frontend ya compilado (`frontend/dist/index.html`), y configura que cualquier enlace externo real (TikTok, la página de impuestos, etc.) se abra en el navegador del sistema en vez de una ventana nueva de Electron.

## Dos rutas de código que cambian según el modo (desarrollo vs. empaquetado)

`main.js` y `migrate.js` calculan las rutas a `backend/`, `frontend/dist/` y `database/` de forma **distinta** según `app.isPackaged`:

- **En desarrollo**: esas carpetas son hermanas de `electron/` en el disco (`path.join(__dirname, '..', 'backend')`, etc.) — funciona porque así está el repositorio.
- **Empaquetado** (el `.exe` ya instalado): `electron-builder` reubica esas carpetas dentro de `resources/` (vía `extraResources` en `package.json`), un lugar distinto a donde vive el propio código de `electron/` — hay que usar `process.resourcesPath` en vez de una ruta relativa, o el `.exe` no encuentra nada y falla al arrancar.

Si alguna vez agregas una ruta nueva a alguno de estos archivos, hay que repetir este mismo patrón (`app.isPackaged ? ... : ...`), o va a funcionar en desarrollo y fallar silenciosamente en el `.exe` instalado.

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

Si algo sale mal en un intento de instalación y quieres empezar de cero, borrar esta carpeta completa (con la app cerrada) hace que la próxima apertura la recree desde cero, como una instalación nueva.

## Generar el instalador para entregar al cliente

```bash
npm run build
```

Usa `electron-builder` (configurado en `package.json`, sección `"build"`) para empaquetar `backend/` (con su `node_modules` incluido — **no se excluye**, o el backend no arranca dentro del `.exe`), `frontend/dist/` y `database/` dentro de un instalador `.exe` de Windows (NSIS) — el cliente solo necesita ejecutarlo, sin instalar Node, PostgreSQL, ni nada por separado.

**`"asar": false`** está puesto a propósito en la configuración — los binarios reales que trae `embedded-postgres` (Postgres en sí) y Puppeteer (Chromium) no pueden ejecutarse correctamente desde dentro de un `.asar` comprimido; necesitan quedar como archivos normales en el disco.

### Problema conocido al correr este comando en Windows

**`Cannot create symbolic link: A required privilege is not held by the client`** — no es un problema de este proyecto, es un bug conocido de `electron-builder`: intenta descargar herramientas de firma de código para macOS (que no usamos, no firmamos nada) y extraerlas requiere un permiso que las cuentas de Windows no tienen por defecto. Dos soluciones, cualquiera de las dos sirve:
- Activar el **Modo de Desarrollador de Windows** (`Configuración → Privacidad y seguridad → Para desarrolladores → Modo de desarrollador`) — una sola vez, sirve para siempre.
- Correr la terminal como **Administrador** — hay que repetirlo cada vez.

El primer build descarga Electron (~115MB) y otras herramientas la primera vez — puede tardar varios minutos. El paso final de empaquetado (comprimiendo Postgres + Chromium + todo el backend) también tarda unos minutos sin mostrar ningún mensaje nuevo en la terminal — es normal, no está colgado.

El instalador queda en `electron/dist/Cafebar Setup 1.0.0.exe`.

## Archivos de este folder

| Archivo | Qué hace |
|---|---|
| `main.js` | Punto de entrada, arranca todo en el orden descrito arriba |
| `postgres-embebido.js` | Inicia/detiene el Postgres embebido, detecta si es la primera vez |
| `migrate.js` | Corre los 6 scripts SQL de `database/` y crea el usuario DIRECTORIO |
