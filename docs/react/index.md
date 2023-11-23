<!--@include: ../guide/parts/links.md-->

# Getting Started

**`@fastify/react`** is **@fastify/vite**'s [**core renderer**](/guide/core-renderers) for [Vue][vue]. It is accompanied by **`@fastify/react/plugin`**, a Vite plugin that complements the renderer package.

It implements all of the features specified in [**Core Renderers**](/guide/core-renderers), including [**automated routing**](/vue/router-setup), [**universal data fetching**](/vue/route-modules#data-fetching) and [**head management**](/vue/route-modules#page-metadata). It's meant to be a lightweight Fastify-flavored replacement to **Next.js** and other full blown SSR Vue frameworks. It is **Fastify-first** in the sense that your Fastify server is responsible for setting everything up via **`@fastify/vite`**.

Below is an overview of all individual documentation topics and the order in which it makes the most sense to read them.

- [Project Structure](/vue/project-structure) covers the structure of a **`@fastify/react`** project, configuration, special folders and others conventions employed.
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
<th>Template</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td valign=top>

<a href="https://github.com/fastify/fastify-vite/tree/dev/starters/vue-base" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">vue-base</code></a>


</td>
<td>

The **react-base** starter template includes just about the minimum set of files to get your `@fastify/react` application going. 

It contains no embedded examples other than `pages/index.jsx`, and no additional dependencies.

### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

`giget gh:fastify/fastify-vite/starters/react-base .`

### Dependencies

- [**`fastify`**](https://github.com/fastify/fastify) as the **Node.js** server.

- [**`vite`**](https://vitejs.dev/) for the client application bundling.

- [**`@fastify/vite`**](https://github.com/fastify/fastify-vite) for Vite integration in Fastify.

- [**`@fastify/react`**](https://github.com/fastify/fastify-vite/tree/dev/packages/fastify-vue) for the Vue application shell.

- [**`unihead`**](https://github.com/galvez/unihead) for `<head>` management.

- [**`@vitejs/plugin-react`**](https://github.com/vitejs/vite-plugin-react) for Vue support in Vite.

- [**`@fastify/one-line-logger`**](https://github.com/fastify/one-line-logger) for better logging in development.

</td>
</tr>
<tr>
<td valign=top>

<a href="https://github.com/fastify/fastify-vite/tree/dev/starters/vue-kitchensink" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">vue-kitchensink</code></a>

</td>
<td>

The **vue-kitchensink** starter template includes all of **vue-base** plus a sample `context.js` initialization file and same additional example routes under `pages/`.


### Download

We recommend using [`giget`](https://github.com/unjs/giget) to download straight from GitHub.

`giget gh:fastify/fastify-vite/starters/react-kitchensink .`

### Dependencies

All dependencies from **react-base** plus:

- [**`unocss`**](https://github.com/unocss/unocss) for [Tailwind](https://unocss.dev/presets/wind) support and many other CSS goodies.

- [**`postcss-preset-env`**](https://www.npmjs.com/package/postcss-preset-env) for [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/) support.

</td>
</tr>
</tbody>
</table>
