#!/bin/bash
# ============================================================
# LiveKit Project — VPS Deploy Script
# Sube el código local al VPS y reinicia los servicios
# ============================================================
set -e

VPS_HOST="${VPS_HOST:-ubuntu@livekit.alvarezconsult.com}"
LOCAL_DIR="/Users/manu/Desktop/LIVEKIT"
REMOTE_DIR="/home/ubuntu/LIVEKIT"

echo "🚀 Desplegando LiveKit al VPS ($VPS_HOST)..."

# 1. Subir código (excluyendo node_modules, venv, db, .git)
echo "📤 Subiendo archivos..."
rsync -avz --delete \
    --exclude 'node_modules/' \
    --exclude 'venv/' \
    --exclude 'venv_*/' \
    --exclude '__pycache__/' \
    --exclude '*.db' \
    --exclude '*.db-shm' \
    --exclude '*.db-wal' \
    --exclude '.git/' \
    --exclude '.DS_Store' \
    --exclude 'dist/' \
    --exclude '*.log' \
    "$LOCAL_DIR/" "$VPS_HOST:${REMOTE_DIR}_NEW/"

# 2. En el VPS: swap de directorios + reinstall + restart
echo "🔧 Ejecutando en VPS..."
ssh "$VPS_HOST" bash -s << 'REMOTE_SCRIPT'
set -e

echo "📁 Actualizando archivos..."
# Preservar la DB existente
cp /home/ubuntu/LIVEKIT/server/data/restaurant.db* /tmp/ 2>/dev/null || true

# Swap directorios
rm -rf /home/ubuntu/LIVEKIT_OLD
mv /home/ubuntu/LIVEKIT /home/ubuntu/LIVEKIT_OLD 2>/dev/null || true
mv /home/ubuntu/LIVEKIT_NEW /home/ubuntu/LIVEKIT

# Restaurar DB
mkdir -p /home/ubuntu/LIVEKIT/server/data
cp /tmp/restaurant.db* /home/ubuntu/LIVEKIT/server/data/ 2>/dev/null || true

# Copiar .env del backup (contiene secrets reales del VPS)
cp /home/ubuntu/LIVEKIT_OLD/agent/.env /home/ubuntu/LIVEKIT/agent/.env 2>/dev/null || true
cp /home/ubuntu/LIVEKIT_OLD/server/.env /home/ubuntu/LIVEKIT/server/.env 2>/dev/null || true
cp /home/ubuntu/LIVEKIT_OLD/frontend/.env.local /home/ubuntu/LIVEKIT/frontend/.env.local 2>/dev/null || true

# Asegurar que server .env tiene las credenciales admin
if ! grep -q "ADMIN_USERNAME" /home/ubuntu/LIVEKIT/server/.env; then
    echo "" >> /home/ubuntu/LIVEKIT/server/.env
    echo "ADMIN_USERNAME=admin" >> /home/ubuntu/LIVEKIT/server/.env
    echo "ADMIN_PASSWORD=nikolina2026" >> /home/ubuntu/LIVEKIT/server/.env
    echo "JWT_SECRET=super-secret-ias-auth-key" >> /home/ubuntu/LIVEKIT/server/.env
fi

echo "📦 Reinstalando dependencias del agente..."
python3 -m venv /home/ubuntu/LIVEKIT/agent/venv
/home/ubuntu/LIVEKIT/agent/venv/bin/pip install -q -r /home/ubuntu/LIVEKIT/agent/requirements.txt

echo "📦 Reinstalando dependencias del servidor..."
python3 -m venv /home/ubuntu/LIVEKIT/server/venv
/home/ubuntu/LIVEKIT/server/venv/bin/pip install -q -r /home/ubuntu/LIVEKIT/server/requirements.txt

echo "🏗️ Construyendo frontend..."
cd /home/ubuntu/LIVEKIT/frontend
npm install --silent
npm run build

echo "🔄 Reiniciando servicios..."
sudo systemctl restart livekit-server.service
sudo systemctl restart livekit-agent.service

sleep 3
echo ""
echo "════════════════════════════════════════"
echo "📊 Estado de los servicios:"
echo "════════════════════════════════════════"
sudo systemctl status livekit-server.service --no-pager -l | head -10
echo ""
sudo systemctl status livekit-agent.service --no-pager -l | head -10
echo ""
echo "✅ Deploy LiveKit completado"
REMOTE_SCRIPT

echo ""
echo "✅ LiveKit desplegado exitosamente en el VPS"
echo "   Frontend: https://livekit.alvarezconsult.com"
echo "   API:      https://livekit.alvarezconsult.com/api/health"
