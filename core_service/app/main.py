"""Minimal API shell for the modular Jarvis Core service."""
from __future__ import annotations
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .orchestrator import respond
from .providers.ollama import ProviderUnavailable

app = FastAPI(title="Jarvis Core API", version="0.1.0", description="Modular Jarvis orchestration API")
_origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "*").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=_origins or ["*"], allow_credentials=False,
                   allow_methods=["GET", "POST"], allow_headers=["Content-Type", "Authorization"])

class Message(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: list[dict[str, str]] = Field(default_factory=list, max_length=12)

@app.get("/")
def root():
    return {"name": "Jarvis Core API", "version": "0.1.0", "status": "ready", "model": "external/local adapter"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "jarvis-core", "model_configured": bool(os.getenv("OLLAMA_BASE_URL"))}

@app.post("/v1/chat")
async def chat_endpoint(body: Message):
    try:
        answer = await respond(body.message, body.history)
        return {"answer": answer, "provider": "ollama-compatible"}
    except ProviderUnavailable as exc:
        raise HTTPException(status_code=503, detail={"code": "model_unavailable", "message": str(exc)}) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
