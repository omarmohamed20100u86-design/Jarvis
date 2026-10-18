export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const expectedToken = process.env.JARVIS_CORE_TOKEN;
  if (!expectedToken) {
    return res.status(503).json({ error: 'core_not_configured', message: 'Set JARVIS_CORE_TOKEN and a protected OLLAMA_BASE_URL in Vercel environment variables.' });
  }
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const baseUrl = (process.env.OLLAMA_BASE_URL || '').replace(/\/$/, '');
  if (!baseUrl || !/^https:\/\//i.test(baseUrl)) {
    return res.status(503).json({ error: 'model_not_configured', message: 'Configure OLLAMA_BASE_URL as a protected HTTPS endpoint. Do not expose an unauthenticated Ollama port.' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body;
  const message = body?.message;
  if (typeof message !== 'string' || !message.trim() || message.length > 4000) {
    return res.status(400).json({ error: 'invalid_message', message: 'Provide a non-empty message up to 4000 characters.' });
  }
  const history = Array.isArray(body.history) ? body.history.slice(-12).filter(x => x && ['user', 'assistant'].includes(x.role) && typeof x.content === 'string').map(x => ({ role: x.role, content: x.content.slice(0, 4000) })) : [];
  try {
    const upstream = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b-instruct',
        stream: false,
        messages: [
          { role: 'system', content: 'You are Jarvis, a helpful assistant. Reply in the user’s language. Never claim to have executed code or controlled a computer unless a trusted tool confirms it. Ask for confirmation before destructive actions.' },
          ...history,
          { role: 'user', content: message.trim() }
        ]
      }),
      signal: AbortSignal.timeout(45000)
    });
    if (!upstream.ok) {
      return res.status(502).json({ error: 'model_upstream_error', upstreamStatus: upstream.status });
    }
    const data = await upstream.json();
    const answer = data?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      return res.status(502).json({ error: 'empty_model_response' });
    }
    return res.status(200).json({ answer: answer.trim(), provider: 'ollama-compatible' });
  } catch (error) {
    return res.status(502).json({ error: 'model_unreachable', message: 'The configured model endpoint could not be reached.' });
  }
}

function safeJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}
