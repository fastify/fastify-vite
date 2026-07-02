---
'@fastify/vite': patch
---

Refactor environment discovery to iterate `viteConfig.environments` directly

Replaces the fragile `findPlugin`/`hasPlugin` config-hook re-invocation pattern with direct iteration of `viteConfig.environments`, which is always available after Vite resolves its config. Also uses `isRunnableDevEnvironment(envConfig).runner` where available to avoid creating duplicate `ModuleRunner` instances for cross-environment imports.
