---
"@fastify/react": patch
"@fastify/vue": patch
---

Remove html-rewriter-wasm dependency

Internal refactor to remove the stale html-rewriter-wasm dependency. No API changes.
HTML manipulation now uses simple regex operations instead of WebAssembly-based parsing.
