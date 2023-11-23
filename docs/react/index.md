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

<a href="https://github.com/fastify/fastify-vite/tree/dev/starters/react-base" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">react-base</code></a>


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
  - includes **`react`**, **`react-dom`** and **`react-router`**

- [**`unihead`**](https://github.com/galvez/unihead) for `<head>` management.

- [**`@vitejs/plugin-react`**](https://github.com/vitejs/vite-plugin-react) for Vue support in Vite.

- [**`@fastify/one-line-logger`**](https://github.com/fastify/one-line-logger) for better logging in development.

</td>
</tr>
<tr>
<td valign=top>

<a href="https://github.com/fastify/fastify-vite/tree/dev/starters/react-kitchensink" target="_blank" rel="noreferrer"><code style="white-space: nowrap;">react-kitchensink</code></a>

</td>
<td>

The **react-kitchensink** starter template includes all of **react-base** plus a sample `context.js` initialization file and same additional example routes under `pages/`.


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

## Known Limitations

- It's currently impossible to run **multiple** Vite development server middleware in your Fastify server, which means `@fastify/vite` can **only be registered once**. Configuration for this is somewhat tricky and there isn't documentation on how to do it. Once [#108](https://github.com/fastify/fastify-vite/pull/108) is completed and merged, it will open the path to have a Vite development server factory that can create instances on-demand, but that approach still remains to be tested.

  If you're looking into a microfrontend setup, consider [this approach](https://dev.to/getjv/react-micro-frontends-with-vite-5442).

- `@fastify/vue` currently has no support for producing a fully functional **static bundle**, that is, even when you use [`clientOnly`](/vue/rendering-modes#client-only), you'd need to be running the Fastify server integrated with the `@fastify/vite` renderer. SPA support is planned for the next major release, see the [project roadmap](/roadmap).

- There's not hot reload for the `context.js` file. This should be addressed in the next major release, see the [project roadmap](/roadmap).
