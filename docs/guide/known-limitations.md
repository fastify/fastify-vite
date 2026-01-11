# Known Limitations

## Encapsulated Plugin Registration

It's currently impossible to run `@fastify/vite` in an encapsulated Fastify plugin. You'll need to register `@fastify/vite` at the root context, or if you want to use it in a plugin, that plugin must be wrapped in [`fastify-plugin`](https://github.com/fastify/fastify-plugin) so it's also registered at the root context.

::: info
Investigation on this has started but is still pending — everything points to `@fastify/middie`, the Express compatibility layer needed to run the Vite development server middleware. It's just considered low-prio at the moment as in most setups, only a single instance is needed anyway.
:::

## Multiple Vite Instances

It's currently impossible to run **multiple** Vite development server middleware in your Fastify server, which means `@fastify/vite` can **only be registered once**. Configuration for this is somewhat tricky and there isn't documentation on how to do it. Once [#108](https://github.com/fastify/fastify-vite/pull/108) is completed and merged, it will open the path to have a Vite development server factory that can create instances on-demand, but that approach still remains to be tested.

If you're looking into a microfrontend setup, consider [this approach](https://dev.to/getjv/react-micro-frontends-with-vite-5442).

## Using @fastify/middie Directly

`@fastify/vite` internally registers `@fastify/middie` in **development mode** to run Vite's dev server middleware. If you need to use middie yourself:

**In development mode:** You can either register middie before `@fastify/vite` (it will detect this and skip its own registration), or simply use `server.use()` after calling `server.vite.ready()`.

**In production mode:** `@fastify/vite` does not register middie since Vite's dev server isn't used. If you need middie in production, you must register it yourself.

```js
import Fastify from 'fastify'
import middie from '@fastify/middie'
import FastifyVite from '@fastify/vite'

const server = Fastify()

// Register middie first - works in both dev and production
await server.register(middie)
await server.register(FastifyVite, { /* options */ })
```
