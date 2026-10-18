export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  return res.status(200).json({
    service: 'jarvis-core',
    status: 'ready',
    modelConfigured: Boolean(process.env.OLLAMA_BASE_URL),
    note: 'Health only; chat requires a protected model endpoint and JARVIS_CORE_TOKEN.'
  });
}
