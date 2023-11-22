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

## Starter templates

Since `@fastify/vite` is not a framework but rather a Fastify plugin, it can't run your application on its own, you need to have your Fastify server, a Vite configuration file, and the basic file structure that make up your frontend.


<table>
<thead>
<tr>
<th>Export</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign=top>

[`vue-base`]()

</td>
<td>

The **vue-base** starter template includes just about the minimum set of files to get your `@fastify/vue` application going. 

It contains no embedded examples other than `pages/index.vue`, and no additional dependencies.

### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

```bash
npx giget gh:fastify/fastify-vite/starters/vue-base .
```

### Dependencies

- [**`fastify`**](https://github.com/fastify/fastify) as the **Node.js** server.

- [**`vite`**](https://vitejs.dev/) for the client application bundling.

- [**`vue`**](https://vuejs.org/) as the client application framework.

- [**`vue-router`**](https://router.vuejs.org/) for the client application routing.

- [**`@fastify/vite`**](https://github.com/fastify/fastify-vite) for Vite integration in Fastify.

- [**`@fastify/vue`**](https://github.com/fastify/fastify-vite/tree/dev/packages/fastify-vue) for the Vue application shell.

- [**`unihead`**](https://github.com/galvez/unihead) for `<head>` management.

- [**`@vitejs/plugin-vue`**]() for Vue support in Vite.

- [**`@fastify/one-line-logger`**](https://github.com/fastify/one-line-logger) for better logging in development.

</td>
</tr>
<tr>
<td>

[`vue-kitchenkink`]()

</td>
<td>

- [**`@vueuse/core`**](https://vueuse.org/) for its rich set of utilities.

- [**`unocss`**](https://github.com/unocss/unocss) for [Tailwind](https://unocss.dev/presets/wind) support and many other CSS goodies.

- [**`postcss-preset-env`**](https://www.npmjs.com/package/postcss-preset-env) for [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/) support.

</td>
</tr>
</tbody>
</table>
