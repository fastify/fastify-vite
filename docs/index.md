
<style>
.headline {
  font-size: 2em;
}
</style>

<p class="headline">
<a href=""><b>Fastify</b></a> plugin for <b>Vite</b> integration<br>
<b>Build</b> and <b>run</b> SSR client applications</p>

A minimal and fast alternative to full blown mega SSR frameworks like Nuxt.js and Next.js.

- Currently supports Vue 3+ and React 17+ — using the same [modular renderer API](/internals/renderer-api.html).
- Automatically registers <b>individual Fastify routes</b> for your client application routes
- Provides generic utilities for [client hydration](/internals/client-hydration) and [isomorphic data fetching](/guide/isomorphic-data).
- No magic application folder (<b>.nuxt</b>, <b>.next</b>), just start with the right [boilerplate flavor](...).

Currently there are two official renderer adapters, [fastify-vite-vue](...) (supports Vue 3+) and [fastify-vite-react](...) (supports React 17+). Both modules follow [the same adapter design](./renderers), which you can also use to provide support for other frameworks, and perhaps submit a Pull Request if you do.

<span style="font-size: 1.8em">Get started with
<b>[Vue](/guide/vue)</b> or <b>[React](/guide/react)</b>.</span>

## New to Fastify?

If you're just getting started with Fastify itself, I'd suggest spending some time getting familiarized with its notion of
[plugins](https://www.fastify.io/docs/latest/Plugins-Guide),
[hooks](https://www.fastify.io/docs/latest/Hooks),
[encapsulation](https://www.fastify.io/docs/latest/Encapsulation) and
[lifecycle](https://www.fastify.io/docs/latest/Lifecycle/).

::: tip
[Matteo Colina's](https://www.youtube.com/watch?v=FQu8FnTzOR0) and [Simon Plenderleith's](https://simonplend.com/learning-fastify/) video introductions are great if you need a little guidance. 

There's also [this article on VueJSDevelopers]() covering one of the first versions of <b>fastify-vite</b> — it tries to tell a longer story about how this plugin got started.
:::

## New to Vite?

Vite is a <b>build tool</b> with an <b>integrated development server</b>. It is based on [Rollup](https://rollupjs.org/) and leverages <b>ESM support</b> in browsers to enable nearly instant <b>Hot Module Replacement</b>, or as it is popularly known, _hot reload_. [Evan You's Vue Mastery course][evan-course] is possibly the best option if you need more guidance, but its documentation is generally straightforward and Vite itself is rather intuitive to get started with.

Also check out Evan You's [Vite 2.0 announcement][vite-2-announcement] for more background.

[evan-course]: https://www.vuemastery.com/courses/lightning-fast-builds-with-vite/intro-to-vite/
[vite-2-announcement]: https://dev.to/yyx990803/announcing-vite-2-0-2f0a

## Meta

Created by [Jonas Galvez](h), a former Nuxt.js <b>core team member</b> and author of several Nuxt.js [articles](https://www.google.com/search?q=jonas+galvez+nuxt) and [modules](https://github.com/galvez?tab=repositories&q=nuxt), and holder of the #1 Google result for [leaving Python for JavaScript](https://www.google.com/search?q=leaving+python+for+javascript). _Giggles_.

<span style="color: #ffcc99; font-weight: bold;">The <b>vision</b> behind this plugin is that <b>Fastify</b> and <b>Vite</b> already offer everything needed to build fast and maintainable applications with ease and elegance</span>. 

No other frameworks should be required <span style="color: #ffcc99; font-weight: bold;">if we can have solid integration between the two</span>. 

<b>Terix</b> is the <b>_parent project_</b> of <b>fastify-vite</b>, encompassing all other necessary Fastify plugins and libraries to make this vision possible.

Maintained with the help of [Paul Isache](https://twitter.com/paul_isache), [Rafael Gonzaga](https://twitter.com/_rafaelgss) and [Ilya Semenov](https://github.com/IlyaSemenov).

<b>MIT</b> licensed.
