# Basic Setup

## Vue 3+

```js
const Fastify = require('fastify')
const fastifyVite = require('fastify-vite')
const fastifyViteVue = require('fastify-vite-vue')

async function getServer () {
  const fastify = Fastify()
  await fastify.register(fastifyVite, {
    renderer: fastifyViteVue,
  })
  return fastify
}

getServer().then(fastify => fastify.listen(3000))
```

```
├─ entry/
│  ├─ client.js
│  └─ server.js
├─ views/
│  ├─ index.vue
│  └─ about.vue
├─ index.html
├─ base.vue
├─ routes.js
├─ main.js
└─ server.js
```

## React 17+

```js
const fastifyViteReact = require('fastify-vite-react')

async function getServer () {
  const fastify = Fastify()
  await fastify.register(fastifyVite, {
    renderer: fastifyViteReact,
  })
  return fastify
}
```

```
├─ entry/
│  ├─ client.js
│  └─ server.js
├─ views/
│  ├─ index.vue
│  └─ about.vue
├─ index.html
├─ base.vue
├─ routes.js
├─ main.js
└─ server.js
```
