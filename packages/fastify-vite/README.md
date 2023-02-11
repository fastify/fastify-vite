<br>

# @fastify/vite [![NPM version](https://img.shields.io/npm/v/@fastify/vite.svg?style=flat)](https://www.npmjs.com/package/@fastify/vite) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

This plugin lets you load a **Vite client application** and set it up for **Server-Side Rendering (SSR)** with Fastify. Alternatively, it can also just serve as a convenience to serve a static Vite **SPA** application through Fastify, automating both the usage of Vite's development server for hot reload and the loading of the production bundle.

It is focused on architectural primitives rather than framework-specific features.

It automates a few aspects of the setup, such as:

- Compiling your Vite application's `index.html` into a templating function for page-level setup.
- Toggling Vite's development server on and off, i.e., run in development or production mode.
- Integrating routing at the client level (History API-based) with Fastify server-side routing.

This README contains all the documentation. Also see the working [`examples/`](https://github.com/fastify/@fastify/vite/tree/dev/examples).

## Install

```
npm i @fastify/vite --save
```

## Usage

First you need to make sure you have `root` correctly set up in your `vite.config.js` file:

```js
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// Import plugins

export default {
  root: join(dirname(fileURLToPath(new URL(import.meta.url))), 'client'),
  plugins: [
    // Register plugins
  ]
}
```

> Note that `__dirname` isn't available in ES modules, that's why we get it from `import.meta.url`.

Next you need to tell **`@fastify/vite`** whether or not it's supposed to run in development mode, in which case Vite's development server is enabled for hot reload — and also, where to load `vite.config.js` from (`root`):

```js
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

const server = Fastify()

await server.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  root: import.meta.url, 
  createRenderFunction () {
    // Covered further below in this README
  }
})

await server.vite.ready()
await server.listen({ port: 3000 })
```

In this example, we're conditioning the development mode to the presence of a `--dev` CLI argument passed to the Node.js process — could be an environment variable. 

> **`@fastify/vite`**'s default value for the `dev` configuration option is actually what you see in the snippet above, a CLI argument check for `--dev`. That's why you don't see it set in any of the [**`examples/`**](), they're just following the convention.

For setting `root`, **`@fastify/vite`** is smart enough to recognize file URLs, so it parses and treats them as directories. In this snippet above, passing `import.meta.url` works the same as passing `__dirname` if it was a CJS module.

As for awaiting on `server.vite.ready()`, this is what triggers the Vite development server to be started (if in development mode) and all client-level code loaded. 

This step is intentionally kept separate from the plugin registration, as you might need to wait on other plugins to be registered for them to be available in **`@fastify/vite`**'s plugin scope.

### Vite's project root

The [**project root**](https://vitejs.dev/guide/#index-html-and-project-root) of your Vite application is treated like a module, so by default, **`@fastify/vite`** will try to load `<project-root>/index.js`. If you're coming from the SSR examples from the [Vite playground](https://github.com/vitejs/vite/tree/main/packages/playground), this is the equivalent of the **server entry point**. 

This is why it's also recommended you keep your client application source code **separate** from server files. In the `vite.config.js` previously shown, the project **root** is set as `client`.

So in `server.js`, the `root` configuration option determines where your `vite.config.js` is located. But in `vite.config.js` itself, the `root` configuration option determines your **project root** in Vite's context. That's what's treated as a module by **`@fastify/vite`**.

It's very important to understand those subtleties before getting started.

### Creating reply.render(), the server-side rendering (SSR) function

**`@fastify/vite`** automatically [decorates](https://www.fastify.io/docs/latest/Reference/Decorators/) the Fastify [Reply](https://www.fastify.io/docs/latest/Reference/Reply/) class with two additional methods, `reply.render()` and `reply.html()`. Let's talk about `reply.render()` first, and how to create it. 

To understand this fully, let's examine [`examples/react-vanilla`](https://github.com/fastify/@fastify/vite/tree/dev/examples/react-vanilla), an educational example demonstrating the absolute minimum glue code for making client-level code available for server-side rendering. 

This basic example has the following structure:

```
├── client
│    ├── base.jsx
│    ├── index.html
│    ├── index.js
│    └── mount.js
├── package.json
├── server.js
└── vite.config.js
```

The first thing to remember is that **`@fastify/vite`** treats your Vite project root as a JavaScript module, so it'll automatically look for `index.js` as the **server entry point**, that is, the module that's gets [bundled for production](https://vitejs.dev/guide/ssr.html#building-for-production) in **_SSR mode_** by Vite.

The React component to be server-side rendered is in `client/base.jsx`:

```jsx
import React from 'react'

export function createApp () {
  return (
    <p>Hello world from React and @fastify/vite!</p>
  )
}
```

Next we have the **client entry point**, which is the code that **mounts** the React instance to the **server-side rendered HTML element**. It is aptly named `client/mount.js`:

```js
import { hydrateRoot } from 'react-dom/client'
import { createApp } from './base.jsx'

hydrateRoot(document.querySelector('main'), createApp())
```

> If we were to skip **server-side rendering** (also possible!) and go straight to client-side rendering, we'd use the [`createRoot()`](https://reactjs.org/docs/react-dom-client.html#createroot) function from `react-dom`, but in this case, since we expect React to find readily available markup delivered by the server, we use [`hydrateRoot()`](https://reactjs.org/docs/react-dom-client.html#hydrateroot).

Now, let's see `client/index.js`:

```js
import { createApp } from './base.jsx'

export default { createApp }
```

All it does is make the `createApp()` function available to the server-side code. In order to create `reply.render()`, **`@fastify/vite`** expects you to provide a `createRenderFunction()` function as a plugin option. This function receives as first parameter the default export from your client module (`client/index.js` above).

Now the following snippet, `server.js`, will be easy to follow:

```js
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { renderToString } from 'react-dom/server'

const server = Fastify()

await server.register(FastifyVite, { 
  root: import.meta.url, 
  createRenderFunction ({ createApp }) {
    return () => {
      return {
        element: renderToString(createApp())
      }
    }
  }
})

await server.vite.ready()
await server.listen({ port: 3000 })
```

You can guess the `createApp` value collected from the first argument passed to `createRenderFunction()` is coming from `client/index.js`. It proceeds to use that to create a new instance of your app, in this case, the root React component, and pass it to `renderToString()` from `react-dom/server`.

A string with a the server-side renderered HTML fragment for your React component is produced by `renderToString()`, and then returned in an object as `element`. The only thing left to do in this example is manually specifying a route to call `reply.render()` from, but we also need to call `reply.html()`:

```js
server.get('/', (req, reply) => {
  reply.html(reply.render())
})
```

That's what's required to get a SSR function for your Vite-bundled application and send the generated markup through a route handler — but there's a big question left to answer: 

How does that HTML fragment end up in `index.html`? 

### Creating reply.html(), the HTML rendering function

Let's shift attention to `client/index.html` now:

```html
<!DOCTYPE html>
<main><!-- element --></main>
<script type="module" src="/mount.js"></script>
```

As per Vite's documentation, `index.html` is a special file made part of the module resolution graph. It's how Vite finds all the code that runs client-side. 

When you run the `vite build` command, `index.html` is what Vite automatically looks for. Given this special nature, you probably want to keep it as simple as possible, using HTML comments to specify content placeholders. That's the pattern used across the official SSR examples from [Vite's playground](https://github.com/vitejs/vite/tree/main/packages/playground).

Before we dive into `reply.html()`, you should know **`@fastify/vite`** packs a helper function that turns an HTML document with placeholders indicated by comments into a precompiled templating function:

```js
import { createHtmlTemplateFunction } from '@fastify/vite'

const template = createHtmlTemplateFunction('<main><!-- foobar --></main>')
const html = template({ foobar: 'This will be inserted '})
```

By default, that function is used internally by the `createHtmlFunction()` configuration option, which is responsible for returning the function that is decorated as `reply.html()`. 

Here's how `createHtmlFunction()` is defined by default:

```js
function createHtmlFunction (source, scope, config) {
  const indexHtmlTemplate = config.createHtmlTemplateFunction(source)
  return function (ctx) {
    this.type('text/html')
    this.send(indexHtmlTemplate(ctx))
  }
}
```

You can see that default definition (and many others) in **`@fastify/vite`**'s [internal `config.js`](https://github.com/fastify/@fastify/vite/blob/dev/packages/@fastify/vite/config.js#L51) file. 

Looking at the default `createHtmlFunction()` above, you can probably guess how the [`react-vanilla`](https://github.com/fastify/@fastify/vite/tree/dev/examples/react-vanilla) example works now. The result of `render()` is a simple object with variables to be passed to `reply.html()`, which uses the precompiled templating function based on `index.html`.

In some cases, it's very likely you'll want to provide your own `createHtmlFunction()` option through **`@fastify/vite`**'s plugin options. For instance, the [`vue-streaming`](https://github.com/fastify/@fastify/vite/tree/dev/examples/react-vanilla) example demonstrates a custom implementation that works with a stream instead of a raw string.

## Deployment

If you try to run any of the [`examples/`](https://github.com/fastify/@fastify/vite/tree/dev/examples) without the `--dev` flag, you'll be greeted with an error message:

```
% node server.js
/../node_modules/@fastify/vite/mode/production.js:6
    throw new Error('No distribution bundle found.')
          ^

Error: No distribution bundle found.
```

This means you're trying to run **`@fastify/vite`** in production mode, in which case a **distribution bundle** is assumed to exist. To build your client application code in preparation for **`@fastify/vite`**, you must run two `vite build` commands, one for the actual client bundle, that gets delivered to the browser, and another for the server-side version of it (what **`@fastify/vite`** sees as the *_client module_*, or *_server entry point_*).

Assuming you're using the default `clientModule` resolution (`/index.js`), these are the `scripts` needed in `package.json`:

```json
"build": "npm run build:client && npm run build:server",
"build:client": "vite build --outDir dist/client --ssrManifest",
"build:server": "vite build --outDir dist/server --ssr /index.js",
```

After running `npm run build` on [`react-vanilla`](https://github.com/fastify/@fastify/vite/tree/dev/examples/react-vanilla), for example, you should see a new `client/dist` folder.


```diff
  ├── client
+ │    ├── dist
  │    ├── base.jsx
  │    ├── index.html
  │    ├── index.js
  │    └── mount.js
  ├── package.json
  ├── server.js
  └── vite.config.js
```

That's where the production bundle of your Vite application is located, so this folder needs to exist before you can run a Fastify server with **`@fastify/vite`** in production mode.

Also note that in **production mode**, **`@fastify/vite`** will serve static assets from your Vite application via [`@fastify/static`](https://github.com/fastify/fastify-static) automatically, but you should consider using a CDN for those files if you can, or just serve through Nginx  instead of directly through Node.js. A detailed guide on how to set this up will be added soon.

## Configuration

The essential configuration options are `root`, `dev` and `createRenderFunction()`. Following the conventions covered in the previous section, setting those is enough to get most simple apps working well. 

But all steps of the setup can be configured isolatedly. 

Below is a execution flow diagram of all configuration functions:

```
├─ prepareClient()
│  ├─ createHtmlFunction()
│  ├─ createRenderFunction()
│  ├─ createRouteHandler()
│  └─ createErrorHandler()
└─ createRoute()
```

### `clientModule`

If unset, **`@fastify/vite`** will automatically try to resolve `index.js` from your Vite project root as your client module. You can override this behavior by setting this option.

### `prepareClient({ routes, ...others }, scope, config)`

As soon as the client module is loaded, it is passed to the `prepareClient()` configuration function. 

See its default definition [here](https://github.com/fastify/@fastify/vite/blob/dev/packages/@fastify/vite/config.js#L39). If it finds `routes` defined, **`@fastify/vite`** will use it to register an individual Fastify (server-level) route for each of your client-level routes (`VueRouter`, `ReactRouter` etc). That's why `prepareClient()` is implemented that way by default.

See the [`react-hydration`](https://github.com/fastify/@fastify/vite/tree/dev/examples/react-hydration) and [`vue-hydration`](https://github.com/fastify/@fastify/vite/tree/dev/examples/vue-hydration) examples to see how the same `routes.js` file is used to set up ReactRouter and VueRouter, and the associated Fastify routes.

### `createHtmlFunction(source, scope, config)`

As covered previously, this is the function that creates the `reply.html()` method.

### `createRenderFunction(clientModule, scope, config)`

As covered previously, this is the function that creates the `reply.render()` method.

### `createRouteHandler(client, scope, options)`

This configuration function creates the default **route handler** for registering Fastify routes based on the client module `routes` exported array (if available). See its [default definition](https://github.com/fastify/@fastify/vite/blob/dev/packages/@fastify/vite/config.js#L71) below:

```js
function createRouteHandler (client, scope, options) {
  return async function (req, reply) {
    const page = await reply.render(scope, req, reply)
    reply.html(page)
  }
}
```

### `createErrorHandler(client, scope, config)`

This configuration function creates the default **error handler** for the Fastify routes registered based on the client module `routes` exported array (if available). See its [default definition](https://github.com/fastify/@fastify/vite/blob/dev/packages/@fastify/vite/config.js#L79) below:

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

### `createRoute({ handler, errorHandler, route }, scope, config)`

Finally, this configuration function is responsible for actually registering an individual Fastify route for each of your client-level routes. See its [default definition](https://github.com/fastify/@fastify/vite/blob/dev/packages/@fastify/vite/config.js#L60) below:

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

### `renderer`

A single configuration object which can be used to set all of the settings above. 

You can see it in the streaming [examples/](https://github.com/fastify/@fastify/vite/tree/dev/examples).

### `spa`

**Disables SSR** and just sets up integration for delivering a static SPA application. When set to `true`, `clientModule` resolution is disabled and the `Reply.html()` method doesn't require a context object with variables for the `index.html` template.

You can see it in the streaming [examples/](https://github.com/fastify/@fastify/vite/tree/dev/examples).

## ⁂

You can consider **`@fastify/vite`** a **microframework for building full stack frameworks**. 

With configuration functions hooking into every step of the setup process, you can easily implement advanced automation for a number of scenarios.

For example, collecting a Next-like `getServerSideProps()` function from every route component and registering an associated payload API endpoint for every route through `createRoute()`. 

See this **[blog post](https://hire.jonasgalvez.com.br/2022/may/18/building-a-mini-next-js/)** for a walkthrough doing just that.

## Meta

Created by [Jonas Galvez](https://hire.jonasgalvez.com.br/), Principal Engineer on Open Source at [NodeSource](https://www.nodesource.com).

This project is sponsored by [NodeSource](https://www.nodesource.com), [NearForm](https://www.nearform.com) and maintained with the help of [these brilliant contributors](https://github.com/fastify/@fastify/vite/graphs/contributors).

## License

MIT
