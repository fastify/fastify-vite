<!--@include: ./parts/links.md-->
<!--@include: ./parts/notice.md-->

# Getting Started

This [Fastify][fastify] plugin allows you to run Vite's development server as middleware, **expose** your [Vite][vite] application to your Fastify application, with configuration hooks to **ease router integration** and **other customizations**, and also automatically serve Vite builds, inferred from a Vite configuration file.

## Why not a framework?

The key principle behind **@fastify/vite** is minimalism, based on the belief that [Fastify][fastify] and [Vite][vite] alone are good enough core foundations. 

Instead of adopting the arbitrary semantics and runtime of a full-blown SSR framework like [Next.js][next] or [Nuxt.js][nuxt], the idea is to **just use Fastify** for your backend needs, and **just use Vite** to build your client application, and still be able to run them together in a happy [modular monolith](https://blog.platformatic.dev/build-and-deploy-a-modular-monolith-with-platformatic).

Your client application can be written of course in whatever framework you like, without losing the ability to also perform SSR if needed. 

In addition to the basic integration building blocks required to run Vite's development server as a middleware and serving your Vite application's production bundle, this plugin offers granular hooks that let you customize your Fastify server according to what your client application module provides, allowing you to essentially **build your own framework**.

> You can read about creating a mini Next.js using [@fastify/vite][fastify-vite] here:
>
> https://hire.jonasgalvez.com.br/2022/may/18/building-a-mini-next-js/

For Vue and React users, [@fastify/vue](/vue/) and [@fastify/react](/react/) are available as starting points featuring essential features from Nuxt.js and Next.js such as **SSR data fetching** and **seamless SSR-to-CSR navigation**, where client-side navigation and rendering takes over after SSR for the first render.

These packages are implemented the same way, following the specification found in [Core Renderers](/guide/core-renderers). And most importantly, these packages are implemented using only the hooks provided by **@fastify/vite**.

## A quick walkthrough

The vanilla React SPA (Single Page Application) project [available in `examples/`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla-spa) is a good starting point to demonstrate the basics of @fastify/vite. The only difference from this to running Vite's own development server directly is that it's executed as a middleware for the Fastify server, allowing other code and custom routes to be added. Vite's development server middleware only runs if you enable it, otherwise it will serve the production bundle (result of running `vite build`), whose location is automatically inferred from the Vite configuration file.

This basic SPA setup requires a Vite configuration file, the Fastify server file and the appropriate commands in `package.json` to run the server in **development and production modes**, and to **build** your Vite application. 

To run this project, `fastify`, `@fastify/vite`, `react` and `react-dom` are the only dependencies required. Vite is only required in development.


::: code-group
```bash [npm]
npm i fastify @fastify/vite react react-dom
npm i vite -D
```
```bash [pnpm]
pnpm add fastify @fastify/vite react react-dom
pnpm add vite -D
```
```bash [yarn]
yarn add fastify @fastify/vite react react-dom
yarn add vite -D
```
:::

### The Fastify server

In `server.js`, notice how starting the development mode is conditioned to the presence of a `--dev` CLI argument passed to the Node.js process — could also be an environment variable. The default value for the `dev` configuration option is actually what you see in this snippet, a CLI argument check for `--dev`. All `server.js` files in the [`examples/`](https://github.com/fastify/fastify-vite/tree/dev/examples) are **using this default behavior**.

::: code-group
```js [server.js]
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

const server = Fastify()

await server.register(FastifyVite, {
  root: import.meta.url, // where to look for vite.config.js
  dev: process.argv.includes('--dev'),
  spa: true
})

server.get('/', (req, reply) => {
  return reply.html()
})

await server.vite.ready()
await server.listen({ port: 3000 })
```
:::

This Fastify server only has a root route and it replies with the result of `reply.html()`. This `html()` method is added by `@fastify/vite`, using the result of the `createHtmlFunction()` configuration hook, and will seamlessly serve either the development or production version of your `index.html`, according to the `dev` configuration setting passed to the `@fastify/vite` plugin options, with or without server-side rendered markup.

As for awaiting on `server.vite.ready()`, this is what triggers the Vite development server to be started (if in development mode) and all client-level code loaded. This step is intentionally kept separate from the plugin registration, as you might need to wait on other plugins to be registered first.

### The Vite config

In `vite.config.js`, notice how the Vite project root is set to `./client`, and in `server.js`, how just passing `import.meta.url` is enough to let `@fastify/vite` know where to look for your Vite configuration file. You can also use `import.meta.dirname` instead of `import.meta.url` if you are on Node v20+.

In dev mode, `@fastify/vite` looks up the Vite configuration options by importing Vite from `node_modules` and then using its Node API to look up the `vite.config` file. This great for dev, but not desirable in production mode since most projects declare Vite as a `devDependency` and exclude it from their final container/docker images to save space.

To support this kind of production build, `@fastify/vite` ships with a Vite plugin that saves the handful of properties that it needs from the resolved Vite configuration object into a cached JSON file. Then, `@fastify/vite` will be able to read this JSON file instead of loading `vite` in production.

::: code-group
```js [vite.config.js]
import { resolve, dirname } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import viteReact from '@vitejs/plugin-react'

export default { 
  root: resolve(import.meta.dirname, 'client'), 
  plugins: [
    viteFastify(),
    viteReact({ jsxRuntime: 'classic' }),
  ],
}
```

#### CACHE_DIR

Note that the location of this cached JSON file is determined by [find-cache-dir](https://www.npmjs.com/package/find-cache-dir), which requires a bit of a special consideration when working in containers like Docker or other environments in which the `node_modules` directory is not writable. If you are running in such an environment, set an environment variable named `CACHE_DIR` to any location you want. Make sure to also copy that `CACHE_DIR` directory from your build step to your final image.

:::

In `package.json`, take note of how the `dev`, `start` and `build` commands are defined, all just using your `server.js` file and Vite. 

::: code-group
```json [package.json]
{
  "type": "module",
  "scripts": {
    "dev": "node server.js --dev",
    "start": "node server.js",
    "build": "vite build"
  },
  "dependencies": {
    "@fastify/vite": "latest",
    "fastify": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "vite": "latest"
  }
}
```
:::

Then for the client code, cleanly separated in the `client/` directory, you have `index.html` loading `mount.js`, `base.jsx` with a React component and `mount.js` loading it. Notice that Vite requires you to have an `index.html` file as it's [the front-and-central build entry point](https://vitejs.dev/guide/#index-html-and-project-root).

::: code-group
```html [client/index.html]
<!DOCTYPE html>
<div id="root"><!-- element --></div>
<script type="module" src="/mount.js"></script>
```

```js [client/mount.js]
import { createRoot } from 'react-dom/client'
import { createApp } from './base.jsx'

const root = createRoot(document.getElementById('root'))
root.render(createApp())
```

```jsx [client/base.jsx]
import React from 'react'

export function createApp () {
  return (
    <p>Hello world from React and @fastify/vite!</p>
  )
}
```
:::

## Directory structure

This is what the directory structure for the example above looks like:

```text{1,5,6}
├── server.js
├── client/
│    ├── base.jsx
│    ├── mount.js
│    └── index.html
├── vite.config.js
└── package.json
```

In all examples in this documentation, the client application code is kept in a `client/` directory, to be explicitly separated from the server code and configuration files. In the `vite.config.js` previously shown, the project **root** is set as `client`.  This is the recommended approach. 

::: warning
It's important to realize that in `server.js`, the `root` configuration option determines where your `vite.config.js` is located. But in `vite.config.js` itself, the `root` configuration option determines your **project root** in Vite's context.
:::

Regardless of whether you want to simply deliver a SPA bundle to the browser or perform SSR, projects using `@fastify/vite` will always need a minimum of **three files**: the Fastify **server**, an [index.html file](https://vitejs.dev/guide/#index-html-and-project-root) and a [Vite configuration file](https://vitejs.dev/config/).

## Architectural primitives

If you want to have access to your client module on the server for SSR or other purposes, **@fastify/vite** offers granular hooks that let you set up a rendering function (receiving access to to your Vite application module), a HTML templating function and register server-side routes for your client routes. The diagram below shows the order of execution of each available hook.

```text
└─ prepareClient()
   └─ createHtmlFunction()
      └─ createRenderFunction()
         └─ createRouteHandler()
            └─ createErrorHandler()
               └─ createRoute()
```

You can consider these **architectural primitives** for building your own framework. Nearly all of them come with sensible defaults that you probably won't need to change for basic use cases, the exception being `createRenderFunction()`. For setting up SSR, you need to tell Fastify how to create a rendering function for your client application, that is, a function that will produce on the server, the same HTML markup your client application would on the client, so it can deliver it [prerendered for speed][ssr-2].

> If you're new to SSR, consider reading [this step-by-step introduction][ssr-1].

[In the next section](/guide/rendering-function), `createRenderFunction()` is explored using both simple and advanced (Nuxt.js and Next.js-like) examples.