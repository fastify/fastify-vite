---
"@fastify/vite": patch
---

Fix MaxListenersExceededWarning on HMR reconnect. Reuse ServerModuleRunner instances instead of creating new ones on every request.
