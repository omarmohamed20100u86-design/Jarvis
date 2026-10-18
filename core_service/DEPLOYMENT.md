# Deployment notes

- `core_service/` is the modular FastAPI service intended for a Python host.
- `api/core/health.js` and `api/core/chat.js` are Vercel-compatible serverless endpoints, useful when a Python host cannot be provisioned.
- The Vercel chat endpoint is deliberately disabled until `JARVIS_CORE_TOKEN` and `OLLAMA_BASE_URL` are configured. Set `JARVIS_CORE_TOKEN` to a long random secret. Never put it in frontend JavaScript or commit it to GitHub.
- `OLLAMA_BASE_URL` must be a protected HTTPS endpoint compatible with Ollama's `/api/chat`. A local `http://127.0.0.1:11434` on your laptop is not reachable from Vercel. Do not expose an unauthenticated Ollama server to the public internet.
- Vercel serverless is not a permanent GPU machine and should not be expected to run local speech models or desktop automation.
- Desktop automation must run in a separately paired local agent, with action allowlists and explicit confirmation for destructive operations.
