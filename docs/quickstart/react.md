
# React

First make sure you have `degit`, a CLI to [scaffold directories pulling from Git][degit]:

[degit]: https://github.com/Rich-Harris/degit

<code>npm i degit -g</code>

Then you can start off with <b>fastify-vite</b>'s base Vue 3 starter or any of the others available:

<code>degit terixjs/flavors/react-base <b>your-app</b></code>

::: tip
[terixjs/flavors](https://github.com/terixjs/flavors) is a mirror to the `examples/` folder from <b>fastify-vite</b>, kept as a convenience for shorter `degit` calls.
:::

After that you should be able to `cd` to `your-app` and run:

<code>npm install</code> — will install <code>fastify</code>, <code>vite</code>, <code>fastify-vite</code> etc from <code>package.json</code>

<code>npm run dev</code> — for running your app with Fastify + Vite's development server

<code>npm run build</code> — for [building](/guide/deployment) your Vite application

<code>npm run start</code> — for serving in production mode
