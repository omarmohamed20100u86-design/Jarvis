# Jarvis Core API (starter)

This directory is an isolated, modular FastAPI backend intended to complement the existing Jarvis frontend without replacing it.

## Local run

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r core_service/requirements.txt
uvicorn core_service.app.main:app --reload --port 8000
```

Open `/health` to check the API and `/docs` for the interactive API reference.

## Optional model

The service uses an Ollama-compatible `/api/chat` endpoint. Configure `OLLAMA_BASE_URL` and optionally `OLLAMA_MODEL` in the environment. The default address is `http://127.0.0.1:11434`, which only works if Ollama is running in the same environment. A cloud deployment cannot reach your laptop's localhost automatically. Do not expose an unprotected Ollama port publicly.

## Render

Build command: `pip install -r core_service/requirements.txt`
Start command: `uvicorn core_service.app.main:app --host 0.0.0.0 --port $PORT`

This starter provides API orchestration only. It does not yet execute arbitrary generated code, access the user's desktop, provide persistent cloud storage, or include speech models. Those should be added as separate, permission-gated local-agent modules and tested before client use. Render's free service may sleep and its local filesystem is not durable.
