<!--@include: ./parts/links.md-->

# Core Renderers

As part of the [`@fastify/vite`][fastify-vite] project, the [`@fastify/vue`][fastify-vue] and [`@fastify/react`][fastify-react] official renderers are provided featuring support for the latest versions of Vue and React, respectively. They aim to be minimal and extensible **application shells** matching the essential features of [Nuxt.js][nuxt] and [Next.js][next] and a little more.

This document serves as a **living specification** of all the features core **`@fastify/vite`** renderers should aim to implement and how.

Bullet points are used for clarity.

## Definitions

- A **core renderer** is a JavaScript package exporting the configuration hooks and options allowed for the `renderer` **`@fastify/vite`** configuration option.

- A **route module** is JavaScript module fully specifying a client-side route, containing the route's component as default export and other additional settings as named exports.

## Route modules

- Route modules **may** be either loaded automatically from a `pages/` folder, following the **Next.js** convention of inferring paths from the directory layout itself, including square brackets for dynamic routes — **or** — they can set their own path by exporting a `path` constant.

- Core renderers **should** make it possible to customize the location where route modules are loaded from.
  > In [**`@fastify/vue`**][fastify-vue] and [**`@fastify/react`**][fastify-react] this is done **via their accompanying Vite plugins**, which accept a `globPattern` parameter indicating what should be passed to `import.meta.glob()`. It does this by preprocessing the internal `routes.js` file.

- Route modules **must** have a **universal context object** that is shared between client and server. This means this object needs to be embedded into the HTML document and made part of the client hydration phase.

- It **must** be possible for **route modules** to export a function that runs on the server before the component, but can also run on the client via an API request, similar to the way `getServerSideProps()` works in **Next.js**. The **core renderer** **must** store data retrieved on the server in the universal route context object, assumed to be part of the client hydration phase.
  > In [**`@fastify/vue`**][fastify-vue] and [**`@fastify/react`**][fastify-react], route modules can export a `getData()` function, which runs on the server during SSR and also on-demand during CSR navigation via an API endpoint that gets automatically registered via [`createRoute()`](/config/#createroute).

- It **must** be possible for **route modules** to export a function to set HTML page metadata (`<title>` and `<meta>` tags) seamlessly (SSR and CSR).
  > In [**`@fastify/vue`**][fastify-vue] and [**`@fastify/react`**][fastify-react], route modules can export a `getMeta()` function, which runs on the server during SSR writings tags directly to the `index.html` template, but also dynamically on-demand during CSR navigation.

- Route modules **may** be able to define a **layout component**, and that be automatically loaded and made available to wrap them.
  > In [**`@fastify/vue`**][fastify-vue] and [**`@fastify/react`**][fastify-react], route modules can export a `layout` flag set to a string matching a component under the `layouts/` directory.

## Rendering modes

- It **must** be possible to render route modules in at least three modes:
  1. **Seamless SSR to CSR** — the default behavior of **Next.js** and **Nuxt.js**, **must** also be the default behavior of core renderers.
  2. **CSR Only**, where **SSR** is skipped altogether and rendering takes place client-side only.
    This can be useful for resource intensive route modules which don't really require to be server-side rendered.
  3. **SSR Only**, where no **CSR** bundle is delivered to the client and rendering is server-side only, producing static markup.

- It **should** also be possible to render route modules in **streaming** mode.

- Route modules **must** be able to specify their rendering modes.
  > In [**`@fastify/vue`**][fastify-vue] and [**`@fastify/react`**][fastify-react], route modules can export `serverOnly`, `clientOnly` and `streaming` flags to alter the default behavior.


## General conventions

- Core renderers **should** employ the **convention** of automatically looking for routes in the `pages/` folder, but **may** make it configurable.
- Core renderers **should** employ the **convention** of automatically looking for route layouts in the `layouts/` folder, but **may** make it configurable.
- Core renderers **should** employ the **convention** of automatically looking for a **universal context** setup function in the `context.js` file.

As stated at the beginning, this document is a **living specification**, but isn't likely to change much. There's only a handful of other features it may expand into supporting, but the goal is to keep it as minimal as possible.

Contributors are very much welcome to update this document with corrections and expansions following any contributions to `@fastify/vue` or `@fastify/react`.
