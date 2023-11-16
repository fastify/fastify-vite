[vite]: https://vitejs.dev/
[fastify]: https://fastify.dev/
[next]: https://nextjs.org/
[nuxt]: https://nuxt.com/
[fastify-vite]: https://fastify-vite.dev
[fastify-static]: https://github.com/fastify/fastify-static

# Getting Started

This [Fastify][fastify] plugin allows you to run Vite's development server as middleware, **expose** your [Vite][vite] application to your Fastify application, and also automatically serve its static bundle, inferred from the Vite configuration file. 

If you want to have access to your client module on the server for SSR or other purposes, @fastify-vite offers granular hooks to help you set up a rendering function, a HTML templating function and register server-side routes for your client routes. It comes with sensible defaults for each of these hooks, 

```
├─ prepareClient()
│  └─ createHtmlFunction()
│      └─ createRenderFunction()
│          └─ createRouteHandler()
│              └─ createErrorHandler()
└─ createRoute()
```




## Basic setup

Regardless of whether you want to perform SSR or simply deliver a SPA bundle to the browser, projects using `@fastify/vite` will always need a minimum of **three files**: the Fastify **server**, an [index.html file](https://vitejs.dev/guide/#index-html-and-project-root) and a [Vite configuration file](https://vitejs.dev/config/).

```text{1,5,6}
├── server.js
├── client/
│    ├── base.jsx
│    ├── mount.js
│    └── index.html
├── vite.config.js
└── package.json
```

## SPA example

## SSR example



That means you can use it to set up an application that serves a static bundle generated from Vite, but also have access to it on the server in order to automatically set up server routes, data fetching and perform Server Side Rendering (SSR).

In a nutshell, this plugin lets you build your own [Next.js][next] or [Nuxt.js][next] on top of Fastify. You can read about creating a mini Next.js using [@fastify/vite][fastify-vite] here:

> https://hire.jonasgalvez.com.br/2022/may/18/building-a-mini-next-js/

If you don't need SSR, it can also just serve as a convenience to serve your static Vite bundle through Fastify via [@fastify/static][fastify-static], automatically inferring your bundle's output directory from your Vite configuration file, and still allowing you to leverage Vite's development server for hot reload.

::: warning
**Don't serve static assets via Node.js in production**! Override static asset requests to a web server such as [NGINX](https://www.nginx.com/) or use [Vite's advanced base options](https://vitejs.dev/guide/build.html#advanced-base-options) to configure a CDN.
:::

## Architectural primitives

It is focused on architectural primitives while employing a few conventions to enable granular control of how your Vite module is exposed to Fastify. 

For instance, if your Vite module exports a `routes` array with objects containing a `path` property, it will automatically loop through it and run [`createRoute()`](/config/createRoute) for each entry. This can allow you to automatically register a server route for each of your client application routes, or multiple server routes, like registering an additional data fetching endpoint for each of your client routes. 

::: info
That's essentially what Next.js does for making things like `getServerSideProps()` work: for each client route, an additional data-only route is also registered automatically. I've demonstrated how to reimplement this in **@fastify/vite** in the [react-next](https://github.com/fastify/fastify-vite/tree/dev/examples/react-next) example.
:::

- Compiling your Vite application's `index.html` into a templating function for page-level setup.
- Toggling Vite's development server on and off, i.e., run in development or production mode.
- Integrating routing at the client level (History API-based) with Fastify server-side routing.

This README contains all the documentation. Also see the working [`examples/`](https://github.com/fastify/fastify-vite/tree/dev/examples).

## Install

```
npm i fastify --save
```
```
npm i @fastify/vite vite --save-dev
```

## Usage

First you need to make sure you have `root` correctly set up in your `vite.config.js` file:

```js
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// Import plugins

export default {
  root: join(dirname(fileURLToPath(import.meta.url)), 'client'),
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
