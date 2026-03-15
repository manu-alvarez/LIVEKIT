#!/bin/bash
set -e

echo "🚀 Iniciando despliegue de IAPuta OS LiveKit (Clean Architecture)..."

# 1. Parar servicios actuales
echo "🛑 Deteniendo servicios antiguos..."
sudo systemctl stop livekit-agent.service || true
sudo systemctl stop livekit-server.service || true

# 2. Backup y Limpieza de Producción
echo "🧹 Preparando entorno de producción..."
if [ -d "/home/ubuntu/LIVEKIT" ]; then
    # Hacer backup de las bases de datos antiguas por seguridad
    mkdir -p /home/ubuntu/LIVEKIT_DB_BACKUP
    cp /home/ubuntu/LIVEKIT/agent/restaurant.db* /home/ubuntu/LIVEKIT_DB_BACKUP/ || true
    
    # Mover el repositorio caótico a OLD
    sudo rm -rf /home/ubuntu/LIVEKIT_OLD
    sudo mv /home/ubuntu/LIVEKIT /home/ubuntu/LIVEKIT_OLD
fi

# El nuevo código se subirá desde local mediante SCP a LIVEKIT_CLEAN_TMP y se moverá aquí
if [ -d "/home/ubuntu/LIVEKIT_CLEAN_TMP" ]; then
    mv /home/ubuntu/LIVEKIT_CLEAN_TMP /home/ubuntu/LIVEKIT
fi

# 3. Restaurar bases de datos si existen en el backup
if [ -f "/home/ubuntu/LIVEKIT_DB_BACKUP/restaurant.db" ]; then
    echo "💾 Restaurando base de datos persistente..."
    mkdir -p /home/ubuntu/LIVEKIT/server/data
    cp /home/ubuntu/LIVEKIT_DB_BACKUP/restaurant.db* /home/ubuntu/LIVEKIT/server/data/
fi

# 4. Configurar Permisos
echo "🔐 Ajustando permisos locales..."
sudo chown -R ubuntu:ubuntu /home/ubuntu/LIVEKIT
chmod +x /home/ubuntu/LIVEKIT/scripts/*.sh || true

# 5. Reconstruir Entornos Virtuales
echo "📦 Construyendo entornos virtuales limpios..."
sudo apt-get install -y python3-venv

echo "🔄 Instalando dependencias del Agente..."
python3 -m venv /home/ubuntu/LIVEKIT/agent/venv
/home/ubuntu/LIVEKIT/agent/venv/bin/pip install -r /home/ubuntu/LIVEKIT/agent/requirements.txt || echo "Agente pip install con warnings"

echo "🔄 Instalando dependencias del Servidor..."
python3 -m venv /home/ubuntu/LIVEKIT/server/venv
/home/ubuntu/LIVEKIT/server/venv/bin/pip install -r /home/ubuntu/LIVEKIT/server/requirements.txt fastapi uvicorn pydantic python-dotenv || echo "Servidor pip install con warnings"

# 6. Recrear Archivos Systemd
echo "⚙️ Regenerando reglas de Systemd..."

cat << 'EOF' | sudo tee /etc/systemd/system/livekit-agent.service
[Unit]
Description=LiveKit Agent Worker (Nikolina)
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/LIVEKIT/agent
Environment="PATH=/home/ubuntu/LIVEKIT/agent/venv/bin:$PATH"
ExecStart=/home/ubuntu/LIVEKIT/agent/venv/bin/python src/agent.py start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

cat << 'EOF' | sudo tee /etc/systemd/system/livekit-server.service
[Unit]
Description=LiveKit FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/LIVEKIT/server
Environment="PATH=/home/ubuntu/LIVEKIT/server/venv/bin:$PATH"
ExecStart=/home/ubuntu/LIVEKIT/server/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

# 7. Recargar e Iniciar
echo "🔥 Reiniciando demonios y levantando arquitectura..."
sudo systemctl daemon-reload
sudo systemctl enable livekit-server.service
sudo systemctl enable livekit-agent.service

sudo systemctl restart livekit-server.service
sudo systemctl restart livekit-agent.service

echo "✅ Despliegue completado con éxito."
sudo systemctl status livekit-server.service --no-pager
sudo systemctl status livekit-agent.service --no-pager
