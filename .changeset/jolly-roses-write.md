---
"@fastify/vite": patch
---

Check decorators before registering `@fastify/middie` internally. This should allow middie to be registered separately if users want to configure specific options.
