# Configuration

## Base options

### `root`

The location of your Vite configuration file.

It works with `import.meta.url` too.

### `dev`

Enables Vite's development server if set to `true`.

Its default value is set to `process.argv.includes('--dev')`, so it will automatically recognize passing the `--dev` flag to your Node.js process unless you change it to something else.

### `vitePluginDistDir`

In dev mode, `@fastify/vite` looks up the Vite configuration options by importing Vite from `node_modules` and then using its Node API to look up the `vite.config` file. This is not desirable in production mode since most projects declare Vite as a `devDependency` and exclude it from their final container/docker images to save space.

To support this kind of production build, `@fastify/vite` ships with a Vite plugin that can save the handful of properties that it needs from the resolved Vite configuration object to a file in your dist directory. This configuration option tells `@fastify/vite` where to look for that file.

To use this option, you must first use the `viteFastify` plugin from `@fastify/vite` inside your `vite.config.js` file:

```js
import { resolve } from "node:path";
import { viteFastify } from "@fastify/vite";

export default {
  // other vite configuration options
  plugins: [
    viteFastify({
      distDir: resolve(import.meta.dirname, "dist"),
    }),
  ],
};
```

Then when you register the `FastifyVite` plugin on to your `Fastify` server, you must also tell it where to look for the vite config dist file:

```js
import { resolve } from "node:path";
import FastifyVite from "@fastify/vite";
import Fastify from "fastify";

const server = Fastify({ logger: true });

await server.register(FastifyVite, {
  // Must match the distDir passed into the Vite plugin shown above
  vitePluginDistDir: resolve(import.meta.dirname, "dist"),

  // ...other options
});
```

**Tip**: If your server file lives in the a `src` directory and compiles to the same `dist` directory as where you want your Vite config dist file to be saved, you can just set `vitePluginDistDir` to `import.meta.dirname`. The compiled server file and the Vite config dist file will be siblings in your `dist` directory. This is common in TypeScript projects.

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
