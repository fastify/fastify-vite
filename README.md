**fastify-vite** is changing rapidly and is now part of a bigger endeavour dubbed **Fastify DX**. 

## Subscribe to [this newsletter](https://www.getrevue.co/profile/fastify-dx) to be notified when the public beta is out.

The 2.x release line has been deprecated and is no longer maintained. Find the legacy documentation [here](https://github.com/fastify/fastify-vite/releases/tag/v2.3.1).

Find below the **`README`** for the upcoming 3.x release line, **currently in beta**.

<br>

# fastify-vite [![NPM version](https://img.shields.io/npm/v/fastify-vite.svg?style=flat)](https://www.npmjs.com/package/fastify-vite) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

This plugin lets you load a **client application module** and set it up for **Server-Side Rendering (SSR)** with Fastify. 

It is focused on architectural primitives rather than specific framework-specific features.

It automates a few aspects of the setup, such as:

- Compile your Vite application's `index.html` into a templating function for page-level setup.
- Toggle Vite's development server on and off, i.e., run in development or production mode.
- Sharing routes at the client level (i.e., VueRouter or ReactRouter routes) to Fastify so an server-side routes can be automatically registered for them, allowing you to leverage Fastify's route-level hooks for them individually.

The new documentation is still in progress. See the the working [`examples/`](https://github.com/fastify/fastify-vite/tree/dev/examples) for now.

## Install

```
npm i fastify-vite --save
```

## Usage

First you need to import the **fastify-vite** Vite plugin (`fastify-vite/plugin`) in your `vite.config.js` file:

```js
// Import other plugins
import viteFastify from 'fastify-vite/plugin'

export default {
  root: join(__dirname, 'client'),
  plugins: [
    // Register other plugins
    viteFastify()
  ]
}
```

> Note that even though `__dirname` isn't available in ES modules, Vite polyfills it you for you.

This file is loaded by **`fastify-vite`** to learn about your Vite application setup. The project **root** of your Vite application is treated like a module, so by default, **`fastify-vite`** will try to load `<project-root>/index.js`. If you're coming from the SSR examples from the Vite playground, this is the equivalent of the **server entry point**.

```js
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'

const server = Fastify()

await server.register(FastifyVite, {
  root: import.meta.url, 
  createRenderFunction ({ createApp }) {
    // createApp assumed to be provided by the client module built via Vite
    return () => {
      return {
        // Use SSR function from your preferred framework
        element: renderComponentToString(createApp())
      }
    }
  }
})

await server.vite.ready()
await server.listen(3000)

```

- `root`: the location of your `vite.config.js` file (`import.meta.url` is treated like `__dirname`)
- `createRenderFunction`: create `reply.render()` method based on the client bundle

## Configuration

All steps of the setup can be configured isolatedly. Below is a diagram of the execution flow of configuration functions:

```
├─ prepareClient()
│  ├─ createHtmlFunction()
│  ├─ createRenderFunction()
│  ├─ createRouteHandler()
│  └─ createErrorHandler()
└─ createRoute()
```

### `clientModule`

### `prepareClient({ routes, ...others }, scope, config)`

### `createHtmlFunction(source, scope, config)`

### `createRenderFunction(clientModule, scope, config)`

### `createRouteHandler(scope, options)`

### `createErrorHandler(scope, config)`

### `createRoute({ handler, errorHandler, route }, scope, config)`
