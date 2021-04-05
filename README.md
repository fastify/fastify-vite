# fastify-vite

[![NPM version](https://img.shields.io/npm/v/fastify-vite.svg?style=flat)](https://www.npmjs.com/package/fastify-vite)
[![Known Vulnerabilities](https://snyk.io/test/github/galvez/fastify-vite/badge.svg)](https://snyk.io/test/github/galvez/fastify-vite)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

[**Fastify**][fastify] plugin to serve [**Vite**][vite] **SSR** applications.

For minimalists who want a **lean, fast** stack where they have as much control 
as possible.

***

**Currently only supports Vue 3**. React version **in the works**.

[fastify]: http://fastify.io/
[vite]: http://vitejs.dev/

Check out recent **[release notes](https://github.com/galvez/fastify-vite/releases)**.

## Install

```
npm install fastify-vite --save-dev
```

## Documentation

- [**Configuration**: How fastify-vite's plugin options interact with Vite's config][config]
- [**Fetching**: Using `useServerAPI()` and `useServerData()` hooks for data fetching][fetching]
- [**Hydration**: The magic behind `fastify-vite`s server data and API method hydration][hydration]
- [**Deployment**: Learn about `fastify-vite`s unified build command for client and server][deployment]

[config]: https://github.com/galvez/fastify-vite/blob/main/docs/config.md
[fetching]: https://github.com/galvez/fastify-vite/blob/main/docs/fetching.md
[hydration]: https://github.com/galvez/fastify-vite/blob/main/docs/hydration.md
[deployment]: https://github.com/galvez/fastify-vite/blob/main/docs/deployment.md

## Usage

Make sure to check out the [example app][example-app] and guides linked above, 
but the essential aspects of **fastify-vite**'s usage are illustrated below:

[example-app]: https://github.com/galvez/fastify-vite/tree/refactor-options/example

```js
async function getServer () {
  const fastify = require('fastify')()

  await fastify.register(require('fastify-vite'), {
    // Where your vite.config.js is located
    // Defaults to process.cwd() if unset
    root: __dirname, 
  })

  fastify.get('/*', fastify.vite.handler)
  
  await fastify.listen(3000)

  console.log('Listening on http://localhost:3000')
}
```

You can also use the shorthand version:

```js
fastify.vite.get(path, options)
```

Which will automatically use `fastify.vite.handler` as the handler.

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

# Contributing

You can install the development version of the plugin in the **example app** with:

```bash
npm run dev:install
```

Use it to develop and test any contributions.

We use the [**conventional commits**](https://www.conventionalcommits.org/en/v1.0.0/) style of commit formatting.

# Philosophy

To fully embrace modern **Node.js** best practices.

Committed to **never replacing standard JavaScript** with anything else.

SSR shouldn't be something magical we need to rely on a megaframework to get done effectively.

SSR patterns are straightforward and can be implemented with a handful of functions. 

This package has just about enough code to build and glue the server and the client, not one bit more.

# Team

- [Jonas Galvez](https://twitter.com/anothergalvez) - **Helloprint** - Core, Vue
- [Paul Isache](https://twitter.com/paul_isache) - **NearForm** - Core, React

# License

MIT
