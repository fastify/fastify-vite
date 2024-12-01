# Virtual Modules

As covered in [Project Structure](/vue/project-structure#smart-links), **`@fastify/vue`** relies on [virtual modules](https://github.com/rollup/plugins/tree/master/packages/virtual) to save your project from having too many boilerplate files. Virtual modules used in **`@fastify/vue`** are **fully ejectable**. For instance, the starter template relies on the `/:root.vue` virtual module to provide the Vue shell of your application. If you copy the `root.vue` file [from the @fastify/vue package](https://github.com/fastify/fastify-vite/blob/main/packages/fastify-vue/virtual/root.vue) and place it your Vite project root, **that copy of the file is used instead**.

## `/:root.vue`

This is the root Vue component. It's used internally by `/:create.js`. You can either use the default version provided by the [smart import](/vue/project-structure#smart-imports) or provide your own.

#### Source from `packages/fastify-vue/virtual/root.vue`:

<<< @../../packages/fastify-vue/virtual/root.vue

## `/:router.vue`

This is the root Vue Router component. Loaded by `/:root.vue`.

#### Source from `packages/fastify-vue/virtual/router.vue`:

<<< @../../packages/fastify-vue/virtual/router.vue

Note that a top-level `<Suspense>` wrapper is necessary because **`@fastify/vue`** has code-splitting enabled at the route-level. You can opt out of code-splitting by providing your own `routes.js` file, but that's very unlikely to be ever required for any reason.

## `/:routes.js`

**`@fastify/vue`** has **code-splitting** out of the box. It does that by eagerly loading all route data on the server, and then hydrating any missing metadata on the client. That's why the routes module default export is conditioned to `import.meta.env.SSR`, and different helper functions are called for each rendering environment.

#### Source from `packages/fastify-vue/virtual/routes.js`:

<<< @../../packages/fastify-vue/virtual/routes.js

## `/:core.js`

Implements `useRouteContext()` and `createBeforeEachHandler()`, used by `core.js`.

`DXApp` is imported by `root.vue` and encapsulates **`@fastify/vue`**'s route component API.

> Vue Router's [nested routes](https://router.vuejs.org/guide/essentials/nested-routes.html) aren't supported yet.

#### Source from `packages/fastify-vue/virtual/core.js`:

<<< @../../packages/fastify-vue/virtual/core.js

## `/:create.js`

This virtual module creates your root Vue component.

This is where `root.vue` is imported.

#### Source from `packages/fastify-vue/virtual/create.js`:

<<< @../../packages/fastify-vue/virtual/create.js

## `/:layouts/default.js`

This is used internally by `/:core.jsx`. If a project has no `layouts/default.vue` file, the default one from **`@fastify/vue`** is used.

#### Source from `packages/fastify-vue/virtual/layouts/default.vue`:

<<< @../../packages/fastify-vue/virtual/layouts/default.vue

## `/:mount.js`

This is the file `index.html` links to by default. It sets up the application with an `unihead` instance for head management, the initial route context, and provides the conditional mounting logic to defer to CSR-only if `clientOnly` is enabled.

#### Source from `packages/fastify-vue/virtual/mount.js`:

<<< @../../packages/fastify-vue/virtual/mount.js
