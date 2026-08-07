# Print Agent — Cafebar

Servicio local que recibe pedidos de impresión desde el sistema web y los manda directo a una impresora específica de Windows, sin depender del diálogo de impresión del navegador.

Corre **solo en la PC física conectada a las impresoras** (normalmente la de Caja) — nunca se sube a la nube.

## Instalación (una sola vez)

```bash
npm install
```

## Arrancarlo manualmente (para probar)

```bash
npm start
```

Debería aparecer:
```
Print Agent Cafebar escuchando en https://localhost:4443
```

La primera vez que abras `https://localhost:4443/health` en el navegador de esa PC, va a mostrar una advertencia de "sitio no seguro" — es normal (el certificado es autofirmado, generado por el propio servicio). Hay que darle **Avanzado → Continuar de todas formas** una sola vez.

## Que arranque solo al prender la PC

1. Presiona `Windows + R`, escribe `shell:startup`, Enter.
2. Crea un acceso directo dentro de esa carpeta que apunte a `npm start` ejecutado desde esta carpeta del proyecto — o crea un archivo `.bat` con el siguiente contenido y pon el acceso directo a ese `.bat`:
   ```bat
   cd C:\ruta\a\print-agent
   npm start
   ```

## Endpoints disponibles

| Método | Ruta        | Qué hace |
| `GET`  | `/health`   | Confirma que el servicio está funcionando |
| `GET`  | `/printers` | Lista las impresoras instaladas en esa PC |
| `GET`  | `/config`   | Devuelve qué impresora está asignada a "Ticket" y a "Cocina" |
| `POST` | `/config`   | Guarda esa asignación |
| `POST` | `/print`    | Recibe `{ tipo: "ticket" \| "cocina", text: "..." }` e imprime |