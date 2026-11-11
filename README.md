# JARVIS + OMNIVISION AI

A voice-first personal assistant with a companion content-operations workspace. Work is isolated on a feature branch so the existing production branch is untouched.

## Current surfaces
- `/` — existing JARVIS voice-first assistant.
- `/omnivision.html` — content command workspace: briefs, channel readiness, production pipeline, local draft export.
- `/api/chat` — model gateway for OpenAI, Groq, Gemini, and Jarvis Core auto routing.
- `/api/search` — optional Serper search endpoint.
- `/api/tts` — optional Piper speech proxy.

## Honest feature status
OMNIVISION currently provides a functional workspace prototype. Briefs are saved in the current browser and can be exported as JSON. It does **not** yet publish to social accounts, generate/render media, or provide live analytics. Those capabilities require platform OAuth/API approvals, secure token storage, a database, and background workers. Channel tiles are not connected accounts.

## Model configuration
Add secrets only in Vercel → Project → Settings → Environment Variables. Never commit keys.

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Groq route |
| `GEMINI_API_KEY` | Gemini 2.5 Flash route |
| `OPENAI_API_KEY` | OpenAI route |
| `XAI_API_KEY` | Optional Grok backend |
| `SERPER_API_KEY` | Optional web search |
| `PIPER_URL` | Optional reachable HTTPS Piper service |
| `OLLAMA_BASE_URL` | Optional protected HTTPS Ollama-compatible endpoint |
| `OLLAMA_MODEL` | Model name |
| `OLLAMA_API_KEY` | Optional bearer token |

Jarvis Core tries a configured protected Ollama-compatible endpoint first, then Gemini, then Groq. It reports missing configuration instead of pretending to work. Never expose an unauthenticated Ollama server publicly.

## Deployment
Vercel is suitable for the web UI and short API requests. It is **not** a persistent GPU machine, desktop-control host, or long-running video-render worker.
1. Deploy the feature branch as a Vercel Preview.
2. Add only model secrets you own.
3. Test assistant routes and the OMNIVISION workspace.
4. Promote to production only after review.
A READY build does not prove provider APIs or OAuth integrations work. SSO may restrict preview URLs.

## GitHub projects worth integrating
These are integration candidates, not code copied into this repository. Review current licenses, security, versions, and deployment requirements before adopting.
- [n8n](https://github.com/n8n-io/n8n) — workflow automation for research, approvals, and schedules.
- [Postiz](https://github.com/gitroomhq/postiz-app) — social publishing/scheduling codebase to evaluate for supported channel adapters.
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI) — image-generation workflows; separate GPU-backed service.
- [FFmpeg](https://github.com/FFmpeg/FFmpeg) — media processing for a dedicated render worker.
- [OpenHands](https://github.com/All-Hands-AI/OpenHands) — candidate for controlled software-agent workflows; never expose unrestricted computer control publicly.

## Production architecture target
- Vercel: UI and short API routes.
- PostgreSQL: channels, briefs, approvals, schedules, audit log.
- Redis + worker: durable queues, retries, rendering orchestration.
- S3-compatible storage: source assets and final media.
- OAuth connection service: per-provider authorization and encrypted refresh tokens.
- Dedicated media worker: FFmpeg, Whisper, ComfyUI and optional TTS.
- Local desktop companion: paired device, visible status, action allowlist, confirmation for destructive operations.

## Security and publishing
- Never store account passwords or request them in chat.
- Gmail OAuth does not grant Meta, TikTok, or YouTube access. Each platform requires its own authorization and may require app review.
- Require human approval before publishing, deleting, sending messages, or changing account settings.
- Keep audit events and idempotency keys.
- Verify rights to music, images, voices, and sources.
- Verify religious quotations/references and require human review.

## Development
The frontend is dependency-light static HTML. API routes use the Vercel Node runtime. Optional FastAPI code under `core_service/` must run on a Python-capable host.
