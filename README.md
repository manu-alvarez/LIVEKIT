# Entorno de voz con LiveKit

El proyecto reúne un cliente React para sesiones LiveKit, un servidor Python y un agente de voz. Cada componente tiene sus propias dependencias.

| Componente | Punto de entrada |
| --- | --- |
| Cliente web | [frontend/src/App.jsx](frontend/src/App.jsx) |
| Servidor Python | [server/main.py](server/main.py) y [dependencias](server/requirements.txt) |
| Agente | [agent/src/agent.py](agent/src/agent.py) y [dependencias](agent/requirements.txt) |
| Servicios de voz | [Whisper](services/openai-whisper-server/) y [Piper](services/piper-server/) |
| Paneles | [Administración](dashboards/admin-dashboard/README.md) y [desarrollo](dashboards/dev-dashboard/README.md) |

## Abrir el cliente en desarrollo

Desde [frontend](frontend/), ejecuta `npm ci`. Configura `VITE_LIVEKIT_URL` en tu entorno local con la dirección WebSocket de tu instancia, siguiendo [.env.example](frontend/.env.example), y ejecuta `npm run dev`. Vite muestra la dirección del cliente. Una sesión de voz completa requiere además el servicio LiveKit, un token de sala y los componentes de servidor correspondientes.

## Emisión de tokens invitados

`POST /api/token` conserva el acceso invitado de la interfaz de voz, con un límite en memoria de **15 solicitudes por IP de conexión cada 5 minutos**. Cuando se supera devuelve HTTP 429 con `Retry-After: 300`. La emisión exige `LIVEKIT_URL`, `LIVEKIT_API_KEY` y `LIVEKIT_API_SECRET`. La identificación de IP utiliza el socket de la petición, no encabezados `X-Forwarded-For` enviados por el cliente.

Este límite es **por proceso**, no reemplaza un límite compartido en el proxy/WAF si se ejecutan varias instancias. Los secretos nunca deben incorporarse al repositorio. La emisión de tokens, por sí sola, no garantiza que el servicio de voz o el despacho de agentes esté disponible.
