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
