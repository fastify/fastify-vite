# Philosophy

Here is the core vision and principles behind this project.

## Fastify first

Nearly all modern frontend JavaScript tooling adheres to the middleware API introduced by [Express](https://expressjs.com/), where stacked up functions each taking `req`,  `res` and `next` as parameters are executed serially.

Next.js built [its own server](https://github.com/vercel/next.js/blob/4f212ee91d0af4355cef62362d08427bb2bca969/packages/next/server/next-server.ts) based on this paradigm, Nuxt.js initially used [connect](https://github.com/senchalabs/connect), which also employed the same paradigm, and then [built their own](https://github.com/unjs/h3), retaining the same paradigm. 

Their approach to providing server functionality is **framework-first**.

::: tip
Middleware functions are easy to grasp and mix up. Vite itself [uses connect](https://github.com/vitejs/vite/blob/a6c8fa3b465d03475a4c372b17cf9f3153b73a84/packages/vite/src/node/server/index.ts) too and it enables it to be integrated with pretty any other Node.js server, including Fastify coupled with this plugin.
:::

That being said, the <b>core vision</b> behind this plugin is to be **Fastify-first**. Due to its **modern**, **minimal** and **well architected core**, including its [encapsulation](https://www.fastify.io/docs/latest/Encapsulation/) mechanism, [hooks](https://www.fastify.io/docs/latest/Hooks/), [decorators](https://www.fastify.io/docs/latest/Decorators/) and [plugin architecture](https://www.fastify.io/docs/latest/Plugins/), <b>[Fastify](https://www.fastify.io/)</b> should be the foundation for web application servers in [Node.js](https://nodejs.org/).

This feature set delivers an immense amount of flexibility in architecting complex Node.js backend solutions, and Fastify does it while [compromising zero on performance](https://www.nearform.com/blog/reaching-ludicrous-speed-with-fastify/), positioning itself as one of the [top performing web application servers](https://github.com/fastify/benchmarks/) for Node.js.

::: tip
To learn about migrating from Express to Fastify, refer to:
- Pawel Grzybek's [From Express to Fastify in Node.js][pawels-article] 
- Simon Plenderleith's [How To Migrate Your App from Express to Fastify][simons-article]

[pawels-article]: https://pawelgrzybek.com/from-express-to-fastify-in-node-js/
[simons-article]: https://www.sitepoint.com/express-to-fastify-migrate/
:::

## Pack light 

<img src="/node_modules.png" style="width: 70%;" />

<table>
<tr>
<th>Tooling</th>
<th>Time to <code>npm install</code></th>
<th>Size of node_modules</th>
</tr>
<tr>
<td>Nuxt.js</td>
<td>18.85s</td>
<td>153M</td>
</tr>
<tr>
<td>Next.js</td>
<td>5.37s</td>
<td>109M</td>
</tr>
<tr>
<td><strong>fastify-vite</strong></td>
<td><strong>4.31s</strong></td>
<td><strong>70M</strong></td>
</tr>
</table>

Another key idea is to **avoid cruft and hidden complexities** by sticking to just [Fastify](https://fastify.io/) and [Vite](https://vitejs.dev/). 

The [Fastify ecosystem](https://www.fastify.io/ecosystem/) provides enough plugins to cover literally every backend need you may have, the community is vibrant and development is active. The same can be said already about Vite, which despite being relatively new, [already has plugins for nearly everything](https://github.com/vitejs/awesome-vite#plugins). 

In short, with <b>fastify-vite</b> you can **mix and match Fastify plugins for your backend needs with Vite plugins for your frontend needs**. You're likely to need some other batteries, like [VueUse](https://vueuse.org/) and [ReactUse](https://github.com/streamich/react-use), but it's a solid foundation for starting small and with the least amount of vendor lock-in.
