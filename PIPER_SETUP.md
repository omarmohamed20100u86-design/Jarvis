# Piper TTS setup for JARVIS

JARVIS now calls `/api/tts` for spoken replies and falls back to the browser's built-in speech when Piper is not configured.

## Important deployment note

The JARVIS frontend is deployed on Vercel. Piper is a Python model server and needs a running host with its voice model installed; this repository's Vercel function proxies requests to that host rather than bundling the model into a serverless deployment.

## Run Piper on a machine or Python host

Official project: https://github.com/OHF-Voice/piper1-gpl

Install the HTTP server:

```sh
python3 -m pip install 'piper-tts[http]'
```

Download a voice supported by Piper (check the official voice list for Arabic voices and their quality/licensing):

https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md

Then start the HTTP server with the chosen voice model:

```sh
python3 -m piper.http_server -m YOUR_VOICE_MODEL
```

The server listens on port 5000 by default. Host it on a reachable HTTPS service; do not use localhost for a deployed Vercel project.

## Connect it to Vercel

In the JARVIS Vercel project, open **Settings → Environment Variables** and add:

- Name: `PIPER_URL`
- Value: the public base URL of the running Piper HTTP server, without a trailing slash (for example, `https://your-piper-host.example.com`)

Redeploy the Vercel project. JARVIS will send text to Piper's `/synthesize` endpoint. Keep the Piper service private or protected where possible; do not expose it as an unrestricted public service.

If `PIPER_URL` is absent or Piper is unreachable, JARVIS falls back to browser speech synthesis.
