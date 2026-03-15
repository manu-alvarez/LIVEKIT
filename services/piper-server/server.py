#!/usr/bin/env python3
"""
Piper TTS HTTP Server
Serves Piper TTS model via HTTP
"""

import os
import io
import base64
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from piper_tts import PiperTTS

app = FastAPI(title="Piper TTS Server")

# Configuration
MODEL_PATH = os.getenv("PIPER_MODEL", "/home/ubuntu/piper/en_US-lessac-medium.onnx")
MODEL_JSON = MODEL_PATH.replace(".onnx", ".json")

tts = None

@app.on_event("startup")
async def startup_event():
    global tts
    print(f"Loading Piper model: {MODEL_PATH}")
    if not os.path.exists(MODEL_PATH):
        print("Model not found. Please download a model.")
        return
    tts = PiperTTS(model_path=MODEL_PATH, model_json=MODEL_JSON)
    print("Piper TTS loaded successfully!")

@app.get("/health")
async def health():
    return {"status": "healthy", "model": MODEL_PATH}

@app.post("/synthesize")
async def synthesize(text: str):
    if tts is None:
        raise HTTPException(status_code=500, detail="TTS model not loaded")
    
    try:
        audio = tts.synthesize(text)
        audio_b64 = base64.b64encode(audio).decode('utf-8')
        return {"audio": audio_b64, "format": "wav"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "10200"))
    uvicorn.run(app, host="0.0.0.0", port=port)
