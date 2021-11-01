
# Integrated Routing

It's important to understand there's routing at the Fastify level, a [highly efficient one](https://github.com/delvedor/find-my-way), and routing at the client application level ([Vue Router](https://next.router.vuejs.org/), [React Router](https://reactrouter.com/) etc).

In order to ensure there can be individual [route level hooks](https://www.fastify.io/docs/latest/Hooks/#route-level-hooks) for each client route, the default behavior of <b>fastify-vite</b> is to register an individual Fastify route for each of your client routes. It does so by looking for a `routes` export in the server entry point for the Vite application.

## Manual Registering

Before we get into the details of how that works, let's have a look at the manual process of registering a Fastify route for a Vite client application route. <b>fastify-vite</b> exposes the following methods:

- `fastify.vite.get(url, options)`
- `fastify.vite.post(url, options)`

These are just a façade to Fastify's own route registration methods, but they will automatically set the route handler to the one provided by <b>fastify-vite</b> — so even though you _can_ provide your own `handler` as part of `options`, you'll only want to do so if you really know what you're doing (i.e., doing highly specific customizations on top of the original <b>fastify-vite</b> handler code).

```js
const app = Fastify()
await app.register(FastifyVite, ...)

app.vite.get('/*')
```

The code above registers a catch-all route that will send every request at the Fastify level to the same route handler, leaving the granular routing to the client application layer. This is not ideal because you lose the ability to register individual hooks and [data fetching functions](/experimental/data-fetching) for each of your routes.

## Views and Routes

<b>fastify-vite</b> introduces a minimalistic idiom for setting views and associates views to routes. All official renderer adapters make use of a `routes.js` file, part of the [project blueprint](/concepts/project-blueprint). 

This file uses the `getRoutes` method from the `fastify-vite/app` module to traverse a list of components from the `views/` directory, loaded by `import.meta.globEager`:

```js
import { getRoutes } from 'fastify-vite/app'

export default getRoutes(import.meta.globEager('/views/*.vue'))
```

This will automatically load all `.vue` files from the `<root>/views` directory, and to determine what route they're associated to, it expects to find a `path` export. 

::: tip
The terms **view** and **route** seem interchangeable for <b>fastify-vite</b> applications, but a single view can be mapped to multiple routes at once, just make the `path` export an array of strings. 
:::

If you create `views/foobar.vue` as follows:

```vue
<script>
export const path = '/'
</script>

<template>
  <h1>Hello World</h1>
</template>
```

It doesn't matter this file is called `foobar.vue`, it will be used to render the `/` route. 

::: tip
This differs from the default `pages/` folder behavior from Nuxt.js and Next.js, where the structure of the folder and filenames are used to generate the routes themselves. You can still use [vite-plugin-pages](https://github.com/hannoeru/vite-plugin-pages) to have the same behavior in your <b>fastify-vite</b> vite apps if you want.
:::

## URL Parameters

The syntax for defining URL parameters is the _roughly_ same for Fastify, [Vue Router](https://next.router.vuejs.org/guide/) and [React Router](https://reactrouter.com/). 

::: tip
Comprehensive tests are missing for asserting the true level of compatibility between Fastify and client application routers — at the time of writing basic URL parameters in the form of `:param` are fully working.
:::

That means when you define a route as folows:

```js
export const path = '/users/:user'
```

Fastify route level `req.params` will include `user`. 

As will `useRoute()` in Vue and `useParams()` in React Router.

::: tip
There's an oportunity for improvement here — which is skipping the route parsing at the client application level if it's provided by Fastify. This is likely to require a coordinated effort with framework authors though.
:::
