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

## Aceptar el certificado (obligatorio, una vez por dispositivo y navegador)

El servicio usa un certificado autofirmado (generado por él mismo, no por una autoridad oficial), así que el navegador va a mostrar una advertencia de "sitio no seguro" la primera vez.

1. Abre `https://localhost:4443/health` directo en el navegador que vayas a usar.
2. Clic en **Avanzado**.
3. Clic en **Continuar a localhost (no seguro)**.
4. Deberías ver: `{"status":"ok","message":"Print Agent Cafebar funcionando"}`

Esto hay que repetirlo **una vez por cada combinación de dispositivo + navegador** que use el sistema (la PC de Caja, el celular de cada mesero, etc.) — después de aceptarlo, ese dispositivo/navegador ya no vuelve a preguntar.

## Que arranque solo al prender la PC (sin ninguna ventana visible)

### 1. Crea `iniciar-print-agent.bat` dentro de esta carpeta
```bat
@echo off
cd /d "%~dp0"
npm start
```

### 2. Crea `iniciar-print-agent-oculto.vbs` dentro de esta carpeta
```vbscript
Set objShell = CreateObject("WScript.Shell")
objShell.Run """" & objShell.CurrentDirectory & "\iniciar-print-agent.bat""", 0, False
```

### 3. Configura el inicio automático
1. Presiona `Windows + R`, escribe `shell:startup`, Enter.
2. Crea un acceso directo dentro de esa carpeta que apunte al archivo **`.vbs`** (no al `.bat`).

Con esto, cada vez que se prenda la PC, el servicio arranca solo, sin ninguna ventana visible en pantalla.

## Cómo confirmar que está corriendo (si arrancó invisible)

Como no hay ninguna ventana visible, para confirmar que sigue activo:

1. Abre el navegador → `https://localhost:4443/health` → si responde el JSON de siempre, está funcionando.

Para verlo como proceso del sistema:

1. `Ctrl + Shift + Esc` → Administrador de tareas → pestaña **Detalles**.
2. En una terminal aparte, corre `netstat -ano | findstr :4443` para obtener el PID que está usando ese puerto.
3. Busca ese PID exacto en la lista de Detalles — ese es el proceso del Print Agent (puede haber varios procesos llamados "Node.js", este paso es para identificar el correcto sin adivinar).
4. Para detenerlo: clic derecho sobre esa fila → **Finalizar tarea**.

## Endpoints disponibles

| Método | Ruta | Qué hace |
|--------|-------------|---|
| `GET`  | `/health`   | Confirma que el servicio está funcionando |
| `GET`  | `/printers` | Lista las impresoras instaladas en esa PC |
| `GET`  | `/config`   | Devuelve qué impresora está asignada a "Ticket" y a "Cocina" |
| `POST` | `/config`   | Guarda esa asignación |
| `POST` | `/print`    | Recibe `{ tipo: "ticket" \| "cocina", text: "..." }` e imprime |

## Cómo se configuran las impresoras

No se edita ningún archivo a mano. Desde el sistema web: **Configuración → Configurar Impresoras** → ahí se escribe la dirección de este servicio (ej. `https://192.168.1.50:4443`), se prueba la conexión, y se elige de una lista desplegable (con las impresoras reales que Windows tiene instaladas en esa PC) cuál va para Ticket y cuál para Cocina.

Si se conecta una impresora nueva más adelante, basta con volver a esa pantalla y darle "Probar Conexión" de nuevo — la lista se actualiza sola, sin tocar ningún archivo ni reiniciar el servicio.