<!--@include: ../guide/parts/links.md-->

# Getting Started

**`@fastify/vue`** is **@fastify/vite**'s [**core renderer**](/guide/core-renderers) for [Vue][vue]. It is accompanied by **`@fastify/vue/plugin`**, a Vite plugin that complements the renderer package.

It implements all of the features specified in [**Core Renderers**](/guide/core-renderers), including [**automated routing**](/vue/router-setup), [**universal data fetching**](/vue/route-modules#data-fetching) and [**head management**](/vue/route-modules#page-metadata). It's meant to be a lightweight Fastify-flavored replacement to **Nuxt.js** and other full blown SSR Vue frameworks. It is **Fastify-first** in the sense that your Fastify server is responsible for setting everything up via **`@fastify/vite`**.

Below is an overview of all individual documentation topics and the order in which it makes the most sense to read them.

- [Project Structure](/vue/project-structure) covers the structure of a **`@fastify/vue`** project, configuration, special folders and others conventions employed.
- [Router Setup](/vue/router-setup) covers how route modules get registered as actual routes, both on the server and the client.
- [Route Modules](/vue/route-modules) covers what makes up route modules, what special exports they have and how they work.
- [Route Context](/vue/route-context) covers the universal **route context** initialization module and the `useRouteContext()` hook, available to all route modules and route layouts.
- [Route Layouts](/vue/route-layouts) covers **route layout modules**.
- [Rendering Modes](/vue/rendering-modes) covers all different route module **rendering modes**.

## Runtime requirements

- [Node.js](https://nodejs.org/en/) v22+.
- We recommend PNPM as a package manager.

Support for other JavaScript environments with HTTP support based on the [Fetch](https://fetch.spec.whatwg.org/) and [Service Worker](https://www.w3.org/TR/service-workers/) standards is coming when [`fastify-edge`](https://github.com/galvez/fastify-edge) is finished.

## Starter templates

Since `@fastify/vite` is not a framework but rather a Fastify plugin, it can't run your application on its own, you need to have your Fastify server, a Vite configuration file, and the basic file structure that make up your frontend.

### <a href="https://github.com/fastify/fastify-vite/tree/dev/starters/vue-base" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">vue-base</code></a>

The **vue-base** starter template includes just about the minimum set of files to get your `@fastify/vue` application going.

It contains no embedded examples other than `pages/index.vue`, and no additional dependencies.

#### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

```
giget gh:fastify/fastify-vite/starters/vue-base#dev your-app
```

#### Dependencies

- [**`fastify`**](https://github.com/fastify/fastify) as the **Node.js** server.

- [**`vite`**](https://vitejs.dev/) for the client application bundling.

- [**`@fastify/vite`**](https://github.com/fastify/fastify-vite) for Vite integration in Fastify.

- [**`@fastify/vue`**](https://github.com/fastify/fastify-vite/tree/dev/packages/fastify-vue) for the Vue application shell.
  - And its peer dependencies:
    - **`devalue`**
    - **`@unhead/vue`**
    - **`vue`**
    - **`vue-router`**

- [**`@vitejs/plugin-vue`**](https://github.com/vitejs/vite-plugin-vue) for Vue support in Vite.

- [**`@fastify/one-line-logger`**](https://github.com/fastify/one-line-logger) for better logging in development.

- [**`tailwind`**](https://github.com/unocss/unocss) and [**`postcss-nesting`**](https://www.npmjs.com/package/postcss-nesting)for [Tailwind](https://unocss.dev/presets/wind) and [CSS Nesting](https://www.w3.org/TR/css-nesting-1/) support.

- [**`postcss-preset-env`**](https://www.npmjs.com/package/postcss-preset-env) for access to all latest CSS features.

### <a href="https://github.com/fastify/fastify-vite/tree/dev/starters/vue-kitchensink" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">vue-kitchensink</code></a>

The **vue-kitchensink** starter template includes all of **vue-base** plus a sample `context.js` initialization file and same additional example routes under `pages/`.


#### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

```
giget gh:fastify/fastify-vite/starters/vue-kitchensink#dev your-app
```

#### Dependencies

All dependencies from **vue-base**.

## Known limitations

- It's currently impossible to run **multiple** Vite development servers, which means `@fastify/vite` can **only be registered once**. Vite's new [Environment API](https://vite.dev/guide/api-environment) was created to avoid this necessity.

- `@fastify/vue` currently has no support for producing a fully functional **static bundle**, that is, even when you use [`clientOnly`](/vue/rendering-modes#client-only), you'd need to be running the Fastify server integrated with the `@fastify/vite` renderer. SPA support is planned for the next major release, see the [project roadmap](/roadmap).

- There's not hot reload for the `context.js` file. This should be addressed in the next major release, see the [project roadmap](/roadmap).
