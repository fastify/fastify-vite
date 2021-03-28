# fastify-vite

[![NPM version](https://img.shields.io/npm/v/fastify-vite.svg?style=flat)](https://www.npmjs.com/package/fastify-vite)
[![Known Vulnerabilities](https://snyk.io/test/github/galvez/fastify-vite/badge.svg)](https://snyk.io/test/github/galvez/fastify-vite)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

[**Fastify**][fastify] plugin to serve [**Vite**][vite] applications.

**Currently only supports Vue 3**. React version **in the works**.

[fastify]: http://fastify.io/
[vite]: http://vitejs.dev/

**Latest release**: **`2.1.0`**.

Check out the **[release notes](https://github.com/galvez/fastify-vite/releases/tag/v2.1.0)**.

This plugin is for minimalists who want a **lean, fast** stack where they have 
as much control as possible. You can build any app with it that you would with 
Nuxt.js or Next.js, for sure, but it's targeted at a more low-level approach 
to development, instead of trying to do everything for you.

## Install

```
npm install fastify-vite --save-dev
```

## Documentation

- [**Configuration**: How fastify-vite's plugin options interact with Vite's config]
- [**Fetching**: Using `useServerAPI()` and `useServerData()` hooks for data fetching][fetching]
- [**Hydration**: The magic behind `fastify-vite`s server data and API method hydration
- [**Deployment**: Learn about `fastify-vite`s unified build command for client and server]

[config]: https://github.com/galvez/fastify-vite/blob/main/docs/config.md
[fetching]: https://github.com/galvez/fastify-vite/blob/main/docs/fetching.md
[hydration]: https://github.com/galvez/fastify-vite/blob/main/docs/hydration.md
[deployment]: https://github.com/galvez/fastify-vite/blob/main/docs/deployment.md

## Basic usage

```js
async function main () {
  const fastify = require('fastify')()
  await fastify.register(require('fastify-vite'), {
    // Where your vite.config.js is located
    // Defaults to process.cwd() if unset
    rootDir: __dirname, 
  })

  fastify.get('/*', fastify.vite.handler)
}

main()
```

You can mount multiple routes on the same `fastify.vite.handler`. The motivation
for this is that **you may want to specify parameters and run hooks at the Fastify
level** for different routes of your Vue 3 app, for instance:

```js
fastify.route({
  url: '/user/:user',
  // Run this preHandler only for /user/:user routes
  async preHandler (req) {
    fastify.metrics.userAccess(req.params.user)
  },
  handler: fastify.vite.handler
})
// For everything else, get to the Vite handler straight away
fastify.get('/*', fastify.vite.handler)
```
