
# @fastify/react [![NPM version](https://img.shields.io/npm/v/@fastify/react.svg?style=flat)](https://www.npmjs.com/package/@fastify/react) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://standardjs.com/)

**Fastify DX for React** (**`@fastify/react`**) is a renderer for [**@fastify/vite**](https://github.com/fastify/fastify-vite).

It has an extremely small core (~1k LOC total) and is built on top of [Fastify](https://github.com/fastify/fastify), [Vite](https://vitejs.dev/), [React Router](https://reactrouter.com/docs/en/v6) and [Valtio](https://github.com/pmndrs/valtio).

## Quick Start

Ensure you have **Node v16+**.

Make a copy of [**starters/react**](https://github.com/fastify/fastify-dx/tree/dev/starters/react). If you have [`degit`](https://github.com/Rich-Harris/degit), run the following from a new directory:

```bash
degit fastify/fastify-dx/starters/react
```

> **If you're starting a project from scratch**, you'll need these packages installed.
>
> ```bash
> npm i fastify @fastify/vite @fastify/react -P
> npm i @vitejs/plugin-react -D
> ```


Run `npm install`. 
  
Run `npm run dev`. 

Visit `http://localhost:3000/`.

## What's Included

That will get you a **starter template** with:
  
- A minimal [Fastify](https://github.com/fastify/fastify) server.
- Some dummy API routes.
- A `pages/` folder with some [demo routes](https://github.com/fastify/fastify-dx/tree/dev/starters/react/client/pages).
- All configuration files.

It also includes some _**opinionated**_ essentials:

- [**PostCSS Preset Env**](https://www.npmjs.com/package/postcss-preset-env) by [**Jonathan Neal**](https://github.com/jonathantneal), which enables [several modern CSS features](https://preset-env.cssdb.org/), such as [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/).

- [**UnoCSS**](https://github.com/unocss/unocss) by [**Anthony Fu**](https://antfu.me/), which supports all [Tailwind utilities](https://uno.antfu.me/) and many other goodies through its [default preset](https://github.com/unocss/unocss/tree/main/packages/preset-uno). 

- [**Valtio**](https://github.com/pmndrs/valtio) by [**Daishi Kato**](https://blog.axlight.com/), with a global and SSR-ready store which you can use anywhere.


## Package Scripts

`npm run dev` boots the development server.
  
`npm run build` creates the production bundle.
  
`npm run serve` serves the production bundle.
