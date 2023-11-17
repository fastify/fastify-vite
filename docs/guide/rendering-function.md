# Rendering Function

**`@fastify/vite`** automatically [decorates](https://www.fastify.io/docs/latest/Reference/Decorators/) the Fastify [Reply](https://www.fastify.io/docs/latest/Reference/Reply/) class with two additional methods, `reply.render()` and `reply.html()`. 

This section explores how to define `reply.render()`.

> Tto learn about `reply.html()` check out [Templating Function](/guide/templating-function).

Consider the project layout from the [`react-vanilla`](https://github.com/fastify/fastify-vite/tree/dev/examples/react-vanilla) example:

```
├── client/
│    ├── base.jsx
│    ├── index.html
│    ├── index.js
│    └── mount.js
├── package.json
├── server.js
└── vite.config.js
```

The first thing to know is that **`@fastify/vite`** treats your Vite project root as a JavaScript module, so it'll automatically look for `index.js` as the **server entry point**, that is, the module that's gets [bundled for production](https://vitejs.dev/guide/ssr.html#building-for-production) in **_SSR mode_** by Vite.

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
