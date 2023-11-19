<!--@include: ../guide/parts/links.md-->

# Getting Started

**`@fastify/vue`** is **@fastify/vite**'s [**core renderer**](/guide/core-renderers) for [Vue][vue].

It implements all of the features specified in [**Core Renderers**](/guide/core-renderers).

- [Project Structure]() covers
- [Rendering Modes]() covers
- [Routing Modes]() covers
- [Data Fetching]() covers
- [Route Layouts]() covers
- [Route Context]() covers
- [onEnter Event]() covers
- [Head Management]() covers
- [Virtual Modules]() covers

## Basic setup

## Starter template

- [**PostCSS Preset Env**](https://www.npmjs.com/package/postcss-preset-env) by [**Jonathan Neal**](https://github.com/jonathantneal), which enables [several modern CSS features](https://preset-env.cssdb.org/), such as [**CSS Nesting**](https://www.w3.org/TR/css-nesting-1/).

- [**UnoCSS**](https://github.com/unocss/unocss) by [**Anthony Fu**](https://antfu.me/), which supports all [Tailwind utilities](https://uno.antfu.me/) and many other goodies through its [default preset](https://github.com/unocss/unocss/tree/main/packages/preset-uno). 

- [**VueUse**](https://vueuse.org/) by [**Anthony Fu**](https://antfu.me/), which provides an extremely rich set of utilities — they're not included in the project build unless explicitly imported and used.




## Basic setup

**@fastify/vue** follows [@fastify/vite](https://github.com/fastify/fastify-vite)'s convention of having a `client` folder with an `index.js` file, which is automatically resolved as your `clientModule` setting. 

::: code-group
```js [server.js]
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import FastifyVue from '@fastify/vue'

const server = Fastify()

await server.register(FastifyVite, { 
  root: import.meta.url, 
  renderer: FastifyVue,
})

await server.vite.ready()
await server.listen(3000)
```

```js [vite.config.js]
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteVue from '@vitejs/plugin-vue'
import viteFastifyVue from '@fastify/vue/plugin'
import unocss from 'unocss/vite'

const path = fileURLToPath(import.meta.url)

const root = join(dirname(path), 'client')
const plugins = [
  viteVue(), 
  viteVueFastifyDX(), 
  unocss()
]

export default { root, plugins }
```
:::


## Package Scripts

`npm run dev` boots the development server.
  
`npm run build` creates the production bundle.
  
`npm run serve` serves the production bundle.
