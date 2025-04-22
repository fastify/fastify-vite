# vue-vanilla-custom-dist

This example shows how to use a _distribution directory_ other than Vite's default (`dist`).

Since `@fastify/vite` assumes the default is used to limit the amount of configuration required, when you change a default, you must make sure both the server layer (`@fastify/vite` plugin options) and the client layer (`vite.config.js` build options) are synchronized.

In `vite.config.js`, add your custom setting for `build.outDir`:

```diff
  import { join } from 'node:path'
  import viteFastify from '@fastify/vite/plugin'
  import vuePlugin from '@vitejs/plugin-vue'
  
  export default {
    root: join(import.meta.dirname, 'client'),
    plugins: [viteFastify(), vuePlugin()],
+   build: {
+     outDir: 'build',
+   }
  }
```

And in `server.js`, add `distDir` to `@fastify/vite`'s plugin options:

```diff
  await server.register(FastifyVite, {
    root: import.meta.url,
+   distDir: 'build',
    dev: dev || process.argv.includes('--dev'),
    async createRenderFunction ({ createApp }) {
      return async () => ({
        element: await renderToString(createApp())
      })
    }
  })
```
