# Cafebar — Backend

API REST en Node.js + Express. En producción, **no corre como un servicio separado que se arranca a mano** — Electron lo levanta automáticamente como parte del arranque de la app de escritorio (ver `electron/main.js`), escuchando siempre en `http://localhost:3000`.

## Arrancar de forma manual (para pruebas puntuales, fuera de Electron)

Normalmente nunca hace falta hacer esto — solo sirve para probar el backend de forma aislada, por ejemplo con Postman o `curl`, sin abrir la app completa.

```bash
npm install
# Crea backend/.env a partir de backend/.env.example
# Necesitas un Postgres corriendo aparte en localhost:5432 (usuario/contraseña postgres, base cafebar)
# con los scripts de database/ ya ejecutados
npm run dev
```

Si no tienes un Postgres propio a mano para esto, es más simple probar todo el sistema junto arrancando Electron normal (ver el README de la raíz) — ese sí levanta su propio Postgres embebido automáticamente.

## Estructura

```
src/
├── config/          # Conexión a Postgres (pg), configuración de multer (uploads)
├── controllers/      # Reciben la request, validan input, llaman al service, responden
├── services/         # Toda la lógica de negocio y las queries SQL directas (parametrizadas)
├── routes/           # Definición de endpoints (mapean URL → controller)
├── middlewares/       # authenticate (JWT), authorize (permisos), restrictByIp
├── utils/            # Funciones puras reutilizables (hash, tokens, validadores, impresoras)
└── scripts/          # Scripts puntuales (ej. sembrar el usuario DIRECTORIO a mano)
```

`index.js` (en la raíz de `backend/`) exporta `startServer()`, que es lo que Electron llama al arrancar. También puede correrse directo con `node index.js` para el caso de prueba manual descrito arriba.

## Patrón obligatorio: controller → service → Postgres

Los controllers nunca escriben SQL directo — siempre llaman a una función de `services/`, que a su vez usa `query()` (de `config/db.js`, basado en `pg`) con consultas parametrizadas (`$1`, `$2`, ...) para evitar inyección SQL.

## Ojo con lo que devuelve `pg`

A diferencia de Supabase (que se usaba en la versión web anterior), `pg` tiene dos comportamientos que generan bugs silenciosos si no se tienen en cuenta:

- **Columnas `BIGINT` se devuelven como texto**, no como número — si comparás un ID sacado de una fila contra un número (`Number(...)`), nunca van a coincidir aunque representen el mismo valor. Hay que convertir explícitamente de un lado o del otro antes de comparar.
- **Columnas `TIMESTAMPTZ`/`DATE` se devuelven como objetos `Date`** de JavaScript, no como texto. Nunca uses un objeto `Date` directo como clave de un `Map` para agrupar cosas — dos objetos `Date`, aunque representen el mismo instante exacto, nunca son `===` entre sí. Conviertelos a `.toISOString()` primero.

## Impresión

`utils/printers.js` habla directo con PowerShell (`Get-Printer` / `Out-Printer`) para listar e imprimir en cualquier impresora instalada en Windows — no hay ningún servicio aparte, certificado, ni configuración de red de por medio. `services/printerService.js` guarda en la base cuál impresora usar para Ticket y cuál para Cocina.

## Correo (Brevo)

Las credenciales de Brevo se guardan en la tabla `system_config`, no en variables de entorno — se configuran desde la propia app (Configuración → Configurar Envío de Correos). `services/emailService.js` las lee de la base en cada envío, así se pueden cambiar sin reiniciar el backend.

## Sobre el empaquetado (`.exe`)

Al generar el instalador (`npm run build` dentro de `electron/`), esta carpeta se copia **completa, incluido su `node_modules`** — si esa carpeta se excluyera, el backend no podría arrancar dentro del `.exe` instalado (`Cannot find module 'express'` y similares). No hay que tocar nada aquí para que esto funcione, solo tener presente que `npm install` en `backend/` debe correrse antes de generar el instalador, para que `node_modules` exista y tenga algo que copiar.
