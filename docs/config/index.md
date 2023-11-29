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

### `prepareClient`

As soon as the client module is loaded, it is passed to the `prepareClient()` configuration function. 

See its default definition [here](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L39). If it finds `routes` defined, **`@fastify/vite`** will use it to register an individual Fastify (server-level) route for each of your client-level routes (**Vue Router**, **React Router** etc). That's why `prepareClient()` is implemented that way by default.

### `createRenderFunction`

This configuration function creates the `reply.render()` method.

It's covered in detail in **[Rendering function](/guide/rendering-function)**.

### `createHtmlFunction`

This configuration function creates the `reply.html()` method.

It's covered in detail in **[Templating function](/guide/rendering-function)**.

### `createRouteHandler`

This configuration function creates the default **route handler** for registering Fastify routes based on the client module `routes` exported array (if available).

### `createErrorHandler`

This configuration function creates the default **error handler** for the Fastify routes registered based on the client module `routes` exported array.

### `createRoute`

this configuration function is responsible for actually registering an individual Fastify route for each of your client-level routes.
