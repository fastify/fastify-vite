# React 17+

<div class="inline-code"><code>
npm i <b>fastify</b> <b>fastify-vite</b> <b>fastify-vite-react</b> --save
</code></div>

## Minimal Boilerplate

Below is a minimal script to boot a Fastify server with an integrated Vite app:

```js
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import renderer from 'fastify-vite-react'

const root = import.meta.url
const app = Fastify({ logger: true })

await app.register(FastifyVite, { root, renderer })
await app.vite.commands()
await app.listen(3000)
```

With that, create a view at `views/index.jsx`:

```jsx
export default function Index () {
  return <h1>Hello World</h1>
}

export const path = '/'
```

::: tip
View files can be named anything, in the examples `index.jsx` is always associated to `/` as a convention.
:::

And then, assuming you have saved the first snippet as `app.mjs`:

<div class="inline-code"><code>
node app.mjs
</code></div>

Take note that `root` and `renderer` are <b>fastify-vite</b>'s only required plugin options. The first is the [Vite application root](https://vitejs.dev/config/#root) and the second determines what [renderer adapter](/concepts/renderer-adapters) to use.

::: tip
All examples in the documentation use [ESM][esm], but it's not required. If you use CJS, use `__dirname` instead of `import.meta.url` when setting the `root` option. It will know the difference.

[esm]: https://nodejs.org/api/esm.html

:::

## Index HTML template

Vite's required `index.html` is provided by <b>fastify-vite-react</b> automatically on the first run if you don't provide one yourself. See the default template below:

```html
<!DOCTYPE html>
<html>
<head>
${helmet.title.toString()}
${helmet.script.toString()}
${helmet.style.toString()}
</head>
<body>
${script}
<div id="app">${element}</div>
<script type="module" src="@app/entry/client.jsx"></script>
</body>
</html>
```

As you can probably imagine, these variable names cannot be changed because they are used by <b>fastify-vite-react</b>'s internal rendering functions. The contents of <b>index.html</b> itself are compiled into a function loaded into memory for maximum performance.

The `@app/` import prefix is used to load the client entry from the project blueprint provided by <b>fastify-vite-vue</b>. If you create a `entry/client.jsx` file at the root of your Vite application, that will be used instead. See [Project Blueprint](/concepts/project-blueprint) for more info on this works.

## Blueprint Files

The fastify-vite-vue package [will provide](/concepts/project-blueprint) nearly all your starting boilerplate. The script where you actually register <b>fastify-vite</b> in your Fastify application being the only exception (you're expected to write it yourself). The files provided by <b>fastify-vite-vue</b> are listed below.

<table class="infotable"><tr><td>
<code class="h inline-block">client.mjs</code></td>
<td>Must export a <code>createApp</code> function <b>returning a React application instance</b>.
</td></tr><tr><td>
<code class="h inline-block">client.jsx</code></td>
<td>Must export the <b>main React component for your app</b>.
<br><br>That would be the one where you set a layout, a router view etc.
</td></tr><tr><td>
<code class="h inline-block">routes.js</code></td>
<td>Must have a default export with the Vite application's routes array.
</td></tr><tr><td>
<code class="h inline-block">entry/client.jsx</code></td>
<td>Vite application client entry point (DOM element mount).
</td></tr><tr><td>
<code class="h inline-block">entry/server.jsx</code></td>
<td>Vite application server entry point (render function and routes).
</td></tr><tr><td>
<code class="h inline-block">index.html</code></td>
<td>Vite application <b>main</b> entry point (loads client entry point).
</td></tr></table>

::: tip
To [quote Evan You](https://twitter.com/youyuxi/status/1362050255009816577), "Vite requires .jsx extension for JSX processing [...] because in most cases plain .js files shouldn't need full AST transforms to work in the browser. Allowing JSX in .js files means every served file must be full-AST-processed just in case it contains JSX."
:::

## Global Data

You can also access [Global Data](/reference/global-data) via the context object returned by the [`useHydration`](/reference/functions) hook.

```vue
import { useHydration } from 'fastify-vite-react/client'

export const path = '/global-data'

export default function GlobalData (props) {
  const [ctx] = useHydration()
  return <p>{JSON.stringify(ctx.$global)}</p>
}
```
