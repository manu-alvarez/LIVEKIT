#!/bin/bash
#16GB+ VRAM"
    echo "Note: Manual installation required. Visit: https://github.com/fixie-ai/ultravox"
    
    mkdir -p /home Native Realtime Models Installation Script
# Run as: bash install_native_realtime.sh
#
# This script installs:
# - Kyutai Moshi (Multimodal AI)
# - MiniCPM-o 2.6 (OMNI Model)
# - Ultravox (Real-time Voice AI)
# - Qwen/ubuntu/LIVEKIT/services/ultravox
    cat > /home/ubuntu/LIVEKIT/services/ultravox/README.md << 'EOF'
# Ultravox

Manual installation required.

## Requirements2-Audio (Audio Understanding)
# - GLM-4-Voice (Voice Conversation)

set -e

echo "=========================================="
echo "Native Realtime Models Installation"

- GPU with 16GB+ VRAM
- Python 3.10+

## Installation
```bash
git clone https://github.com/fixie-ai/ultravox
cdecho "=========================================="

# Check for GPU
if command -v nvidia-smi &> /dev/null; then
    echo "✓ NVIDIA GPU detected"
    ultravox
pip install -r requirements.txt
```

## Run
```bash
python -m ultravox.server --port 12002 nvidia-smi --query-gpu=name,memory.total --format=csv
    GPU_MEMORY=$(nvidia-smi --query-gpu=memory.total --format=csv
```
EOF
}

# Install GLM-4-Voice
install_glm4() {
    echo ""
    echo "Installing GLM-4-Voice..."
    echo "GLM,noheader,nounits | head -1)
    echo "  GPU Memory: ${GPU_MEMORY} MB"
else
    echo "⚠ Warning: No NVIDIA GPU detected"
-4-Voice is a voice conversation model from THU."
    echo "Requires: GPU with 24GB+ VRAM"
    echo "Note: Manual installation required. Visit: https    echo "  Some models require GPU with 16GB+ VRAM"
fi

# Check Docker
if ! command -v docker &> /://github.com/THUDM/GLM-4-Voice"
    
    mkdir -p /home/ubuntu/LIVEKIT/services/glm4-voice
    cat > /homedev/null; then
    echo "✗ Docker is not installed"
    exit 1
fi

echo ""
echo "=========================================="
echo "Installing/ubuntu/LIVEKIT/services/glm4-voice/README.md << 'EOF'
# GLM-4-Voice

Manual installation required.

## Requirements
- GPU with 24GB+ VR Kyutai Moshi"
echo "=========================================="
docker pull ghcr.io/kyutai/stt:latest
docker pullAM
- Python 3.10+

## Installation
```bash
git clone https://github.com/THUDM/GLM-4-Voice
cd GLM-4-Voice ghcr.io/kyutai/tts:latest

echo ""
echo "=========================================="
echo "Installing MiniCPM-o 2.6"
echo "=========================================="
#
pip install -r requirements.txt
```

## Run
```bash
python app.py --port 12004
```
EOF
}

# Main execution
echo "Running MiniCPM-o requires manual installation from source
# https://github.com/OpenBMB/MiniCPM-o
echo "Note: MiniCPM system checks..."
check_gpu
check_docker
check_ollama

echo ""
echo "Installing Native Realtime Models..."
echo ""

install_qwen2_audio
install_moshi
-o requires manual installation"
echo "  git clone https://github.com/OpenBMB/MiniCPM-o.git"
echo "  cd MiniCPM-o"
install_minicpm
install_ultravox
install_glm4

echo ""
echo "=============================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "============================================echo "  pip install -e ."

echo ""
echo "=========================================="
echo "Installing Ultravox"
echo "=========================================="
# Ultravox requires manual installation
# https://github.com/fixie-ai/ultravox
echo "Note: Ultravox requires manual installation"
echo "  pip install ultravox"

echo ""
