# Configuration

## Base options

### `root`

### `dev`

### `spa`

**Disables SSR** and just sets up integration for delivering a static SPA application. When set to `true`, `clientModule` resolution is disabled and the `Reply.html()` method doesn't require a context object with variables for the `index.html` template.

### `renderer`

A single configuration object which can be used to set all of the settings above. 

- `clientModule`
  'createErrorHandler',
  'createHtmlFunction',
  'createHtmlTemplateFunction',
  'createRenderFunction',
  'createRoute',
  'createRouteHandler',
  'prepareClient'

  

## Renderer options

### `clientModule`

If unset, **`@fastify/vite`** will automatically try to resolve `index.js` from your Vite project root as your client module. You can override this behavior by setting this option.

### `prepareClient`

As soon as the client module is loaded, it is passed to the `prepareClient()` configuration function. 

See its default definition [here](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L39). If it finds `routes` defined, **`@fastify/vite`** will use it to register an individual Fastify (server-level) route for each of your client-level routes (`VueRouter`, `ReactRouter` etc). That's why `prepareClient()` is implemented that way by default.

See the [`react-hydration`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-hydration) and [`vue-hydration`](https://github.com/fastify/fastify-vite/tree/dev/examples/vue-hydration) examples to see how the same `routes.js` file is used to set up ReactRouter and VueRouter, and the associated Fastify routes.

### `createRenderFunction`

This configuration function creates the `reply.render()` method.

### `createHtmlFunction`

This configuration function creates the `reply.html()` method.

### `createRouteHandler`

# `createRouteHandler(client, scope, options)`

This configuration function creates the default **route handler** for registering Fastify routes based on the client module `routes` exported array (if available). See its [default definition](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L71) below:

```js
function createRouteHandler (client, scope, options) {
  return async function (req, reply) {
    const page = await reply.render(scope, req, reply)
    reply.html(page)
  }
}
```


### `createErrorHandler`

This configuration function creates the default **error handler** for the Fastify routes registered based on the client module `routes` exported array (if available). See its [default definition](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L79) below:

```js
function createErrorHandler (client, scope, config) {
  return (error, req, reply) => {
    if (config.dev) {
      console.error(error)
      scope.vite.devServer.ssrFixStacktrace(error)
    }
    scope.errorHandler(error, req, reply)
  }
}
```


### `createRoute`

# `createRoute({ handler, errorHandler, route }, scope, config)`

Finally, this configuration function is responsible for actually registering an individual Fastify route for each of your client-level routes. See its [default definition](https://github.com/fastify/fastify-vite/blob/dev/packages/fastify-vite/config.js#L60) below:

```js
function createRoute ({ handler, errorHandler, route }, scope, config) {
  scope.route({
    url: route.path,
    method: 'GET',
    handler,
    errorHandler,
    ...route,
  })
}
```
