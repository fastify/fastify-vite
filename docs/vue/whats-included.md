<br>

# @fastify/vue [![NPM version](https://img.shields.io/npm/v/@fastify/vue.svg?style=flat)](https://www.npmjs.com/package/@fastify/vue) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

**Fastify DX for Vue** (**`@fastify/vue`**) is a renderer for [**@fastify/vite**](https://github.com/fastify/fastify-vite).

It lets you run and SSR (server-side render) **Vue 3 applications built with Vite** on [Fastify](https://fastify.io/), with a minimal and transparent **server-first approach** — where everything starts with `server.js`, your actual Fastify server.

It has an extremely small core (~1k LOC total) and is built on top of [Fastify](https://github.com/fastify/fastify), [Vite](https://vitejs.dev/) and [Vue Router](https://router.vuejs.org/).

## Quick Start

Ensure you have **Node v16+**.

Make a copy of [**starters/vue**](https://github.com/fastify/fastify-dx/tree/dev/starters/vue). If you have [`degit`](https://github.com/Rich-Harris/degit), run the following from a new directory:

```bash
degit fastify/fastify-dx/starters/vue
```

> **If you're starting a project from scratch**, you'll need these packages installed.
>
> ```bash
> npm i fastify @fastify/vite @fastify/vue -P
> npm i @vitejs/plugin-vue -D
> ```


Run `npm install -f`. 
  
Run `npm run dev`. 

Visit `http://localhost:3000/`.

## What's Included

That will get you a **starter template** with:
  
- A minimal [Fastify](https://github.com/fastify/fastify) server.
- Some dummy API routes.
- A `pages/` folder with some [demo routes](https://github.com/fastify/fastify-dx/tree/dev/starters/vue/client/pages).
- All configuration files.

It also includes some _**opinionated**_ essentials:

- [**PostCSS Preset Env**](https://www.npmjs.com/package/postcss-preset-env) by [**Jonathan Neal**](https://github.com/jonathantneal), which enables [several modern CSS features](https://preset-env.cssdb.org/), such as [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/).

- [**UnoCSS**](https://github.com/unocss/unocss) by [**Anthony Fu**](https://antfu.me/), which supports all [Tailwind utilities](https://uno.antfu.me/) and many other goodies through its [default preset](https://github.com/unocss/unocss/tree/main/packages/preset-uno). 

- [**VueUse**](https://vueuse.org/) by [**Anthony Fu**](https://antfu.me/), which provides an extremely rich set of utilities — they're not included in the project build unless explicitly imported and used.

## Package Scripts

`npm run dev` boots the development server.
  
`npm run build` creates the production bundle.
  
`npm run serve` serves the production bundle.
