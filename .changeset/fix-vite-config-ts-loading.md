---
"@fastify/vite": patch
---

Fix: Use Vite's resolveConfig to load TypeScript config files without requiring tsx loader

Previously, `vite.config.ts` files required running Node.js with a TypeScript loader like `tsx` because the config file was directly imported via `import()`. Now the config is loaded through Vite's `resolveConfig` API which handles TypeScript internally using esbuild, and `createServer` is passed the config file path to let Vite handle resolution natively.
