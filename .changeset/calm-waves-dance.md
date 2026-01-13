---
"@fastify/vite": patch
---

Fix static routes to respect registration prefix. When registering @fastify/vite with a `prefix` option, static assets and public files are now correctly served under that prefix.
