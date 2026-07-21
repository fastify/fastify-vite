---
"@fastify/react": minor
---

Update `@fastify/react` routing to use `resolvePkgDir` with `config.root`. This ensures that relative paths set in the vite config's `build.outDir` are resolved correctly according to the `FastifyViteOptions` configuration.
