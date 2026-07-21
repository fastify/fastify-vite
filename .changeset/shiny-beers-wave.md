---
"@fastify/react": minor
"@fastify/vite": minor
---

Update `@fastify/react` routing to use `resolvePkgDir` with `config.root`. This ensures that relative paths in `config.vite.build.outDir` are resolved correctly according to the `FastifyViteOptions` configuration.
