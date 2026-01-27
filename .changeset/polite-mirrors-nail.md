---
"@fastify/vite": major
---

Rewrite in TypeScript with ESM-only output.

### Breaking Changes

- **ESM-only package**: The package now sets `"type": "module"` and only ships ESM. CommonJS `require` export entries have been removed.

- **Node.js compatibility**: Users on Node.js 20.19.0+ or 22.12.0+ can continue using `require('@fastify/vite')` thanks to native [`require(esm)` support](https://joyeecheung.github.io/blog/2025/12/30/require-esm-in-node-js-from-experiment-to-stability/). Users on older Node.js versions must switch to `import` or upgrade Node.js.

### Migration

If you're on an older Node.js version and using CommonJS:

```js
// Before (CJS)
const fastifyVite = require('@fastify/vite')

// After (ESM)
import fastifyVite from '@fastify/vite'
```

Or upgrade to Node.js 20.19.0+ / 22.12.0+ where `require()` of ESM modules is natively supported.
