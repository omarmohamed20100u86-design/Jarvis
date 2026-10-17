FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 PIPER_VOICE=ar_JO-kareem-medium
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN python -m pip install --no-cache-dir 'piper-tts[http]'
RUN python -m piper.download_voices ${PIPER_VOICE}
EXPOSE 10000
CMD ["sh", "-c", "python -m piper.http_server --host 0.0.0.0 --port ${PORT:-10000} -m ${PIPER_VOICE}"]
