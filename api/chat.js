const providers = {
  openai: { url: "https://api.openai.com/v1/chat/completions", key: "OPENAI_API_KEY", model: "gpt-4o-mini" },
  groq: { url: "https://api.groq.com/openai/v1/chat/completions", key: "GROQ_API_KEY", model: "llama-3.3-70b-versatile" },
  grok: { url: "https://api.x.ai/v1/chat/completions", key: "XAI_API_KEY", model: "grok-3-mini" }
};
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { provider = "openai", messages = [], language = "en-US" } = req.body || {};
  const system = language.startsWith("ar")
    ? "أنت JARVIS، مساعد ذكي وودود. أجب بوضوح وباختصار مناسب للصوت. إذا لم تكن متأكدًا فقل ذلك."
    : "You are JARVIS, a helpful, capable voice-first assistant. Answer naturally and concisely because replies may be spoken aloud. Be honest about uncertainty.";
  try {
    let response, data;
    if (provider === "core") {
      const ollamaUrl = (process.env.OLLAMA_BASE_URL || "").replace(/\/$/, "");
      if (ollamaUrl && /^https:\/\//i.test(ollamaUrl)) {
        response = await fetch(ollamaUrl + "/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...(process.env.OLLAMA_API_KEY ? { Authorization: "Bearer " + process.env.OLLAMA_API_KEY } : {}) },
          body: JSON.stringify({ model: process.env.OLLAMA_MODEL || "qwen2.5:1.5b-instruct", stream: false, messages: [{ role: "system", content: system + " You are running through Jarvis Core; be clear about limitations and never claim a tool action succeeded unless verified." }, ...messages.slice(-20)] }),
          signal: AbortSignal.timeout(45000)
        });
        data = await response.json();
        if (!response.ok) return res.status(502).json({ error: data.error?.message || "Configured Ollama-compatible model failed." });
        return res.status(200).json({ reply: data.message?.content || "The configured model returned an empty response.", engine: "ollama-compatible" });
      }
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
      if (geminiKey) {
        const contents = [{ role: "user", parts: [{ text: system + " You are running through Jarvis Core; be clear about limitations and never claim a tool action succeeded unless verified." }] }, ...messages.slice(-20).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content || "") }] }))];
        response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(geminiKey), {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents, generationConfig: { temperature: 0.5, maxOutputTokens: 1200 } })
        });
        data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Gemini request failed." });
        return res.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "I couldn't generate a reply.", engine: "gemini-2.5-flash" });
      }
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + groqKey },
          body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: system + " You are running through Jarvis Core; be clear about limitations and never claim a tool action succeeded unless verified." }, ...messages.slice(-20)], temperature: 0.5, max_tokens: 1200 })
        });
        data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Groq request failed." });
        return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "I couldn't generate a reply.", engine: "groq" });
      }
      return res.status(503).json({ error: "Jarvis Core has no model configured. Add a protected HTTPS OLLAMA_BASE_URL, or configure a free-tier GEMINI_API_KEY/GROQ_API_KEY in Vercel Environment Variables." });
    }
    if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
      if (!key) return res.status(503).json({ error: "Gemini is not configured. Add GEMINI_API_KEY or GEMINI_KEY in Vercel → Settings → Environment Variables." });
      const contents = [{ role: "user", parts: [{ text: system }] }, ...messages.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.content || "") }] }))];
      response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(key), {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents, generationConfig: { temperature: 0.7, maxOutputTokens: 1200 } })
      });
      data = await response.json();
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Gemini request failed." });
      return res.status(200).json({ reply: data.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "I couldn't generate a reply." });
    }
    const config = providers[provider];
    if (!config) return res.status(400).json({ error: "Unknown AI provider." });
    const key = process.env[config.key];
    if (!key) return res.status(503).json({ error: config.key + " is missing. Add it in Vercel → Project Settings → Environment Variables, then redeploy." });
    response = await fetch(config.url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + key }, body: JSON.stringify({ model: config.model, messages: [{ role: "system", content: system }, ...messages.slice(-20)], temperature: 0.7, max_tokens: 1200 }) });
    data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "AI provider request failed." });
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "I couldn't generate a reply." });
  } catch (error) {
    return res.status(500).json({ error: "Unable to reach the AI provider. Please try again." });
  }
}