# JARVIS Piper speech service

This container runs the Piper HTTP synthesis server with the Arabic (Jordanian) Kareem medium voice.

- Build context: `piper-service`
- Dockerfile: `piper-service/Dockerfile`
- Render service type: Docker web service
- HTTP port: `PORT` (Render supplies this; defaults to 10000 locally)
- Synthesis endpoint: `/synthesize`
- Health/info endpoint: `/info`

Voice list and licensing: https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md

This is a CPU service. A free Render instance has only 512 MB RAM and can run slowly or be restarted if it exceeds resource limits. For persistent, reliable use, a paid instance may be necessary.
