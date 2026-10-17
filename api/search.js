export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const query = String(req.body?.query || "").trim();
  if (!query || query.length > 500) return res.status(400).json({ error: "Enter a search query (up to 500 characters)." });
  const key = process.env.SERPER_API_KEY;
  if (!key) return res.status(503).json({ error: "SERPER_API_KEY is missing. Add it to Vercel Environment Variables." });
  try {
    const response = await fetch("https://google.serper.dev/search", { method: "POST", headers: { "X-API-KEY": key, "Content-Type": "application/json" }, body: JSON.stringify({ q: query, num: 8 }) });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.message || "Search request failed." });
    return res.status(200).json({ answerBox: data.answerBox || null, knowledgeGraph: data.knowledgeGraph || null, organic: (data.organic || []).map(x => ({ title: x.title, link: x.link, snippet: x.snippet })) });
  } catch { return res.status(500).json({ error: "Web search is temporarily unavailable." }); }
}