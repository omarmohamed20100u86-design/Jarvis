"""Small adapter for an optional Ollama-compatible chat endpoint."""
from __future__ import annotations
import os
import httpx

class ProviderUnavailable(RuntimeError):
    pass

async def chat(messages: list[dict[str, str]]) -> str:
    base_url = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
    model = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b-instruct")
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{base_url}/api/chat",
                json={"model": model, "messages": messages, "stream": False},
            )
            response.raise_for_status()
            payload = response.json()
            answer = payload.get("message", {}).get("content")
            if not isinstance(answer, str) or not answer.strip():
                raise ProviderUnavailable("The model returned an empty response.")
            return answer.strip()
    except (httpx.HTTPError, ValueError, KeyError) as exc:
        raise ProviderUnavailable(
            "No reachable Ollama model is configured. Set OLLAMA_BASE_URL to a reachable, protected model endpoint."
        ) from exc
