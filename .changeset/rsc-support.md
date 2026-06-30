---
"@fastify/react": minor
"@fastify/vite": patch
---

Add React Server Components (RSC) support to `@fastify/react` via `@vitejs/plugin-rsc`. Routes opt in with `export const rsc = true`; the plugin registers a 3-environment build (client/rsc/ssr), companion `_.rsc` routes for client navigation, server actions, and streaming SSR with embedded flight data. TypeScript variants of all new virtual modules ship alongside the JS variants.

Also refactors `@fastify/vite`'s development mode to read `viteConfig.environments` directly instead of re-invoking the plugin's `config` hook to discover environments, supporting any number of environments (not just the hardcoded client/ssr pair).