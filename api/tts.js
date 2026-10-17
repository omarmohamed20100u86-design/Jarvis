export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { text = "", language = "en-US" } = req.body || {};
  const input = String(text).trim();
  if (!input) return res.status(400).json({ error: "Text is required." });
  if (input.length > 4000) return res.status(413).json({ error: "Text is too long (max 4000 characters)." });
  const base = process.env.PIPER_URL;
  if (!base) return res.status(503).json({ error: "Piper is not connected yet. Set PIPER_URL to your running Piper HTTP server URL in Vercel Environment Variables." });
  try {
    const response = await fetch(base.replace(/\/$/, "") + "/synthesize", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "audio/wav" },
      body: JSON.stringify({ text: input })
    });
    if (!response.ok) return res.status(502).json({ error: "Piper synthesis failed (" + response.status + ")." });
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", response.headers.get("content-type") || "audio/wav");
    res.setHeader("Content-Length", String(audio.length));
    return res.status(200).send(audio);
  } catch {
    return res.status(502).json({ error: "Cannot reach Piper. Check that PIPER_URL points to a running Piper HTTP server." });
  }
}
