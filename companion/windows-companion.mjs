import http from "node:http";
import os from "node:os";
import crypto from "node:crypto";

const HOST = "127.0.0.1";
const PORT = Number(process.env.JARVIS_COMPANION_PORT || 47821);
const startedAt = Date.now();
const pairingCode = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
const token = crypto.randomBytes(32).toString("hex");
let paired = false;
let failedAttempts = 0;

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || "";
  if (origin && !(/^https:\/\//i.test(origin) || /^http:\/\/localhost(?::\d+)?$/i.test(origin) || /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin))) {
    return send(res, 403, { ok: false, error: "Origin not allowed" });
  }
  res.setHeader("Access-Control-Allow-Origin", origin || "null");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method !== "GET") return send(res, 405, { ok: false, error: "Method not allowed" });

  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  if (url.pathname === "/ping" || url.pathname === "/health") {
    return send(res, 200, { ok: true, service: "jarvis-windows-companion", version: "0.2.0", host: HOST, port: PORT, computer: os.hostname(), uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000), pairing: paired ? "paired" : "waiting" });
  }
  if (url.pathname === "/pair") {
    if (paired) return send(res, 409, { ok: false, error: "Already paired. Restart the companion to pair again." });
    if (++failedAttempts > 10) return send(res, 429, { ok: false, error: "Too many pairing attempts. Restart the companion." });
    if (url.searchParams.get("code") !== pairingCode) return send(res, 401, { ok: false, error: "Incorrect pairing code." });
    paired = true;
    return send(res, 200, { ok: true, paired: true, token, computer: os.hostname() });
  }
  if (url.pathname === "/status") {
    if (!paired || url.searchParams.get("token") !== token) return send(res, 401, { ok: false, paired: false, error: "Device not linked." });
    return send(res, 200, { ok: true, paired: true, computer: os.hostname() });
  }
  return send(res, 404, { ok: false, error: "Not found", health: "/ping" });
});

server.on("error", error => {
  console.error("JARVIS Companion could not start:", error.message);
  if (error.code === "EADDRINUSE") console.error("Port 47821 is already in use. Close the other app or set JARVIS_COMPANION_PORT to another port.");
  process.exitCode = 1;
});
server.listen(PORT, HOST, () => {
  console.log("JARVIS Windows Companion is running.");
  console.log(`Health check: http://${HOST}:${PORT}/ping`);
  console.log("");
  console.log("JARVIS LAPTOP PAIRING CODE: " + pairingCode);
  console.log("Enter this code in the JARVIS chat using: connect laptop " + pairingCode);
  console.log("This code works once. Keep this window open while using the companion.");
});
