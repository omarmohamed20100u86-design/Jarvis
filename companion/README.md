# JARVIS Windows Companion (starter)

This is a small local health-check service for Windows. It listens only on `127.0.0.1:47821` and responds at:

- `http://127.0.0.1:47821/ping`
- `http://127.0.0.1:47821/health`

## Run it

1. Install Node.js LTS from https://nodejs.org/ if it is not already installed.
2. Double-click `start-windows.bat`.
3. Keep the terminal window open.
4. Open `http://127.0.0.1:47821/ping`. A JSON response with `"ok": true` means the local service is running.

## Important limitation

This starter only provides a local health endpoint. It does **not** yet implement pairing codes, device authentication, microphone streaming, Piper TTS, or browser-to-desktop commands. The current web app's `index.html` does not call this service, so running it alone will not clear a separate “DEVICE not linked” message. Those pieces must be integrated against the exact pairing protocol used by the UI before it can be called a complete companion.

The service binds to loopback only and does not expose a remote command-execution endpoint.
