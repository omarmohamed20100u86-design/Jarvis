"""Request orchestration, intentionally separate from model and tools."""
from __future__ import annotations
from .providers.ollama import chat, ProviderUnavailable

SYSTEM_PROMPT = (
    "You are Jarvis, a helpful assistant. Reply in the user's language. "
    "Do not claim to have run code, changed files, or controlled a computer unless a tool result confirms it. "
    "For potentially destructive computer actions, ask for explicit confirmation."
)

async def respond(message: str, history: list[dict[str, str]] | None = None) -> str:
    if not message.strip():
        raise ValueError("message must not be empty")
    clean_history: list[dict[str, str]] = []
    for item in (history or [])[-12:]:
        role = item.get("role")
        content = item.get("content")
        if role in ("user", "assistant") and isinstance(content, str):
            clean_history.append({"role": role, "content": content[:4000]})
    messages = [{"role": "system", "content": SYSTEM_PROMPT}, *clean_history,
                {"role": "user", "content": message[:4000]}]
    return await chat(messages)
