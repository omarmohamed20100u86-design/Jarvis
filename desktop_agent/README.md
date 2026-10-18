# Jarvis Local Desktop Agent — planned module

This folder marks the boundary for a future Windows-side agent. Desktop automation must run on the target computer; a cloud API cannot directly control the user's phone or laptop. Before enabling it, implement pairing/authentication, an allowlist of actions, a visible running indicator, audit logs, and confirmation for destructive actions. Never expose a desktop-control endpoint directly to the public internet.
