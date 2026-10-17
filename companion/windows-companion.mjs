import http from "node:http";
import os from "node:os";

const HOST = "127.0.0.1";
const PORT = Number(process.env.JARVIS_COMPANION_PORT || 47821);
const startedAt = Date.now();

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || "";
  // Only permit browser pages served over HTTPS/localhost; never expose this service to the LAN.
  if (origin && !(/^https:\/\//i.test(origin) || /^http:\/\/localhost(?::\d+)?$/i.test(origin) || /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin))) {
    res.writeHead(403, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ ok: false, error: "Origin not allowed" }));
  }
  res.setHeader("Access-Control-Allow-Origin", origin || "null");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  if (req.method !== "GET") {
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }
  if (req.url === "/ping" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      ok: true,
      service: "jarvis-windows-companion",
      version: "0.1.0",
      host: HOST,
      port: PORT,
      computer: os.hostname(),
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
      pairing: "not-configured"
    }));
  }
  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ ok: false, error: "Not found", health: "/ping" }));
});

server.on("error", error => {
  console.error("JARVIS Companion could not start:", error.message);
  if (error.code === "EADDRINUSE") console.error("Port 47821 is already in use. Close the other app or set JARVIS_COMPANION_PORT to another port.");
  process.exitCode = 1;
});
server.listen(PORT, HOST, () => {
  console.log("JARVIS Windows Companion is running.");
  console.log(`Health check: http://${HOST}:${PORT}/ping`);
  console.log("Keep this window open while using the companion.");
});
