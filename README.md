# fastify-vite
![CI workflow](https://github.com/fastify/fastify-env/workflows/CI%20workflow/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Fastify plugin to serve Vite applications.

## Install

```
npm install --save fastify-vite
```

## Usage

```js
const fastify = require('fastify')()
const fastifyVite = require('fastify-vite')

fastify.register(fastifyVite, {
  rootDir: __dirname,
  srcDir: resolve(__dirname, 'src'),
})

fastify.get('/*', fastify.vite.handler)
```

## Data

To fetch data on the server, use it for server rendering, and rehydrate later 
for client rendering, similar to what Nuxt and Next.js do, this plugin provides 
the following idiom:

```js
fastify.vite.get('/with-data*', (req) => {
  req.vite.push({ message: 'server-data' })
})
```

This will cause `window.$ssrData` to be written to the client using 
[`@nuxt/devalue`](https://github.com/nuxt-contrib/devalue). That key can be 
customized via `options.ssrDataKey`.
