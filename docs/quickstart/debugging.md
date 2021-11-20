---
sidebarDepth: 2
---

# Debugging

Vite's SSR support is still evolving and some issues remain.

## Error when evaluating SSR module

Barring any syntax or application level errors, the most [common cause](https://github.com/vitejs/vite/issues/2579) is faulty mixed CJS/ESM setups in external dependencies. This is what it'll look like:

```
[vite] Error when evaluating SSR module
```

You can avoid it by using the following idiom:

```js
const dependency = await (async () => {
  if (import.meta.env.SSR) {
  	const { createRequire } = await import('module')
  	const require = createRequire(import.meta.url)
  	return require('<your-troubled-dependency>')
  } else {
  	return import('<your-troubled-dependency>')
  }
})()
```

## Sticky cache

Sometimes you might notice some change is not taking place. Typically this happens when updating dependencies, due to the [caching of pre-bundled dependencies](https://vitejs.dev/guide/dep-pre-bundling.html#file-system-cache).

When that happens, run `rm -f node_modules/.vite`.

## Server Hot Module Reload

Unrelated to Vite but rather to Fastify, server-side HMR is not supported, unless you're using [fastify-cli](https://github.com/fastify/fastify-cli) which will automatically restart the Fastify server when files change. If you change a route hook, `getData`, `getPayload` functions exported by a view, you'll need to restart.
