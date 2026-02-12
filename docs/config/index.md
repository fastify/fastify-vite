# Configuration

## Base options

### `root`

The location of your Vite configuration file.

It works with `import.meta.url` too.

### `dev`

Enables Vite's development server if set to `true`.

Its default value is set to `process.argv.includes('--dev')`, so it will automatically recognize passing the `--dev` flag to your Node.js process unless you change it to something else.

### `spa`

When set to `true`, **disables SSR** and just sets up integration for delivering a static SPA application.

`clientModule` resolution is disabled and the `Reply.html()` method doesn't require a context object with variables for the `index.html` template.

This can be customized however by providing your own `createHtmlFunction()`.

### `baseAssetUrl`

Custom base URL for assets in production HTML output. Use this for CDN deployments where static assets are served from a different origin than your application server.

```js
await server.register(FastifyVite, {
  root: import.meta.url,
  baseAssetUrl: process.env.CDN_URL,
})
```

This option works by replacing Vite's [`base`](https://vite.dev/config/shared-options.html#base) path in your HTML with the specified URL. For example, if your Vite `base` is `/` (the default), then `/assets/main.js` becomes `https://cdn.example.com/assets/main.js`. If your Vite `base` is `/app/`, then `/app/assets/main.js` becomes `https://cdn.example.com/assets/main.js`.

The transformation happens once at server startup, so there's no per-request overhead. Local `@fastify/static` routes are still registered as a fallback.

See [Serving assets from a CDN](/guide/build-and-deploy#serving-assets-from-a-cdn) for more details.

### `fastifyStaticOptions`

Options forwarded to the underlying [`@fastify/static`](https://github.com/fastify/fastify-static) registrations in production mode. Use this to configure `preCompressed`, `maxAge`, `immutable`, `setHeaders`, and any other `@fastify/static` option.

The `root`, `prefix`, and `serve` options are managed internally by `@fastify/vite` and cannot be overridden.

```js
await server.register(FastifyVite, {
  root: import.meta.url,
  fastifyStaticOptions: {
    preCompressed: true,
    maxAge: 31536000,
    immutable: true,
    setHeaders(res) {
      res.setHeader('X-Custom-Header', 'value')
    },
  },
})
```

This is especially useful when using `@fastify/compress`, which strips the `Content-Length` header during gzip compression. If you have an nginx reverse proxy using HTTP/1.0 upstream connections, you can pre-compress your assets at build time and use `preCompressed: true` to serve them directly with the correct `Content-Length` intact.

These options only apply in production mode. In development mode, Vite's dev server handles static file serving.

### `renderer`

A single configuration object which can be used to set all [Renderer options](/config/#renderer-options).

- `clientModule`
- `createErrorHandler`
- `createHtmlFunction`
- `createHtmlTemplateFunction`
- `createRenderFunction`
- `createRoute`
- `createRouteHandler`
- `prepareClient`

## Renderer options

### `clientModule`

If unset, **`@fastify/vite`** will automatically try to resolve `index.js` from your Vite project root as your client module. You can override this behavior by setting this option.

### `prepareClient(clientModule, scope, config)`

As soon as the client module is loaded, it is passed to the `prepareClient()` configuration function.

See its default definition [here](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L39). If it finds `routes` defined, **`@fastify/vite`** will use it to register an individual Fastify (server-level) route for each of your client-level routes (**Vue Router**, **React Router** etc). That's why `prepareClient()` is implemented that way by default.

### `createRenderFunction`

This configuration function creates the `reply.render()` method.

It's covered in detail in **[Rendering function](/guide/rendering-function)**.

### `createHtmlFunction(source, scope, config)`

This configuration function creates the `reply.html()` method.

It's covered in detail in **[Templating function](/guide/rendering-function)**.

### `createRouteHandler({ client, route }, scope, config)`

This configuration function creates the default **route handler** for registering Fastify routes based on the client module `routes` exported array (if available).

### `createErrorHandler({ client, route }, scope, config)`

This configuration function creates the default **error handler** for the Fastify routes registered based on the client module `routes` exported array.

### `createRoute({ handler, errorHandler, route }, scope, config) {`

this configuration function is responsible for actually registering an individual Fastify route for each of your client-level routes.
