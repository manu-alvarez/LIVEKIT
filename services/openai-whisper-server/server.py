#!/usr/bin/env python3
"""
OpenAI Whisper HTTP Server
Serves OpenAI Whisper model via HTTP for transcription
"""

import os
import asyncio
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import whisper
import uvicorn

app = FastAPI(title="OpenAI Whisper Server")

# Load model at startup
MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")
model = None

@app.on_event("startup")
async def startup_event():
    global model
    print(f"Loading Whisper model: {MODEL_SIZE}")
    model = whisper.load_model(MODEL_SIZE)
    print("Model loaded successfully!")

@app.get("/health")
async def health():
    return {"status": "healthy", "model": MODEL_SIZE}

@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        content = await audio.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Transcribe
        result = model.transcribe(tmp_path)
        return {"text": result["text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    port = int(os.getenv("PORT", "9002"))
    uvicorn.run(app, host="0.0.0.0", port=port)
