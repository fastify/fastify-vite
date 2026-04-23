---
"@fastify/vite": minor
---

Align the renderer typings with the actual runtime contract and export the shared renderer types so TypeScript renderer packages can build against them instead of redeclaring them. Also widens `reply.html()` to allow string and stream returns and a synchronous `createHtmlFunction`. Type-only.
