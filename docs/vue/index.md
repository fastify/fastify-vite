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

## Runtime Requirements

- [Node.js](https://nodejs.org/en/) v18 — you should upgrade to [v20 LTS](https://nodejs.org/en/blog/announcements/v20-release-announce) to benefit from [massive performance improvements](https://blog.rafaelgss.dev/state-of-nodejs-performance-2023)!
- We recommend PNPM as a package manager.

Support for other JavaScript environments with HTTP support based on the [Fetch](https://fetch.spec.whatwg.org/) and [Service Worker](https://www.w3.org/TR/service-workers/) standards is coming when [`fastify-edge`](https://github.com/galvez/fastify-edge) is finished.

## Starter templates

Since `@fastify/vite` is not a framework but rather a Fastify plugin, it can't run your application on its own, you need to have your Fastify server, a Vite configuration file, and the basic file structure that make up your frontend.

## <a href="https://github.com/fastify/fastify-vite/tree/dev/starters/vue-base" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">vue-base</code></a>

The **vue-base** starter template includes just about the minimum set of files to get your `@fastify/vue` application going. 

It contains no embedded examples other than `pages/index.vue`, and no additional dependencies.

### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

```
giget gh:fastify/fastify-vite/starters/vue-base#dev your-app
```

### Dependencies

- [**`fastify`**](https://github.com/fastify/fastify) as the **Node.js** server.

- [**`vite`**](https://vitejs.dev/) for the client application bundling.

- [**`@fastify/vite`**](https://github.com/fastify/fastify-vite) for Vite integration in Fastify.

- [**`@fastify/vue`**](https://github.com/fastify/fastify-vite/tree/dev/packages/fastify-vue) for the Vue application shell.
  - And its peer dependencies:
    - **`devalue`**
    - **`unihead`**
    - **`vue`**
    - **`vue-router`**

- [**`@vitejs/plugin-vue`**](https://github.com/vitejs/vite-plugin-vue) for Vue support in Vite.

- [**`@fastify/one-line-logger`**](https://github.com/fastify/one-line-logger) for better logging in development.

The **vue-kitchensink** starter template includes all of **vue-base** plus a sample `context.js` initialization file and same additional example routes under `pages/`.


### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

```
giget gh:fastify/fastify-vite/starters/vue-kitchensink#dev your-app
```

### Dependencies

All dependencies from **vue-base** plus:

- [**`@vueuse/core`**](https://vueuse.org/) for its rich set of utilities.

- [**`unocss`**](https://github.com/unocss/unocss) for [Tailwind](https://unocss.dev/presets/wind) support and many other CSS goodies.

- [**`postcss-preset-env`**](https://www.npmjs.com/package/postcss-preset-env) for [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/) support.

## Known Limitations

- It's currently impossible to run **multiple** Vite development server middleware in your Fastify server, which means `@fastify/vite` can **only be registered once**. Configuration for this is somewhat tricky and there isn't documentation on how to do it. Once [#108](https://github.com/fastify/fastify-vite/pull/108) is completed and merged, it will open the path to have a Vite development server factory that can create instances on-demand, but that approach still remains to be tested.

  If you're looking into a microfrontend setup, consider [this approach](https://dev.to/getjv/react-micro-frontends-with-vite-5442).

- `@fastify/vue` currently has no support for producing a fully functional **static bundle**, that is, even when you use [`clientOnly`](/vue/rendering-modes#client-only), you'd need to be running the Fastify server integrated with the `@fastify/vite` renderer. SPA support is planned for the next major release, see the [project roadmap](/roadmap).

- There's not hot reload for the `context.js` file. This should be addressed in the next major release, see the [project roadmap](/roadmap).
