---
title: Fastify plugin for Vite integration
---

::: tip
**This is a work in progress.**

You're seeing the <b>new documentation suite</b> for [<b>fastify-vite 2.2.0-beta.6</b>](https://www.npmjs.com/package/fastify-vite).

Right now only the [vue-base](https://github.com/terixjs/flavors/tree/main/vue-base) and [react-base](https://github.com/terixjs/flavors/tree/main/react-base) boilerplates are fully tested. 

Please [report issues on GitHub](https://github.com/terixjs/fastify-vite/).
:::

<style>
.headline {
  font-size: 2em;
}
</style>

<p class="headline">
<a href="https://fastify.io"><b>Fastify</b></a> plugin for <a href="https://vitejs.dev"><b>Vite</b></a> integration<br>
<b>Build</b> and <b>run</b> SSR client applications</p>

A minimal and fast alternative to full blown mega SSR frameworks like Nuxt.js and Next.js.

- Currently supports **Vue 3** and **React 17** — using the same [modular renderer API](/concepts/renderer-api.html).
- Automatically registers **individual Fastify routes** for your client application routes.
- Provides **generic utilities** for [client hydration](/concepts/client-hydration) and **isomorphic data fetching**.
- **No magic app folder** (<b>.nuxt</b>, <b>.next</b>), just start with the right [boilerplate flavor][flavors].

[flavors]: https://github.com/terixjs/flavors

<span style="font-size: 1.8em">Get started with
<b>[Vue](/quickstart/vue)</b> or <b>[React](/quickstart/react)</b>.</span>

## New to SSR?

In the literal sense, pretty much any web application can be said to be server-side rendered (SSR). The term was popularized following the birth of [React](https://reactjs.org/) and [Vue](https://vuejs.org/) and their support for creating JavaScript applications that can be prerendered on the server via Node.js prior to being delivered to the browser. This very nicely covered in [this Google Developers article][gd-article] by [Jason Miller][jason-miller] and [Addy Osmani][addy-osmani].

[gd-article]: https://developers.google.com/web/updates/2019/02/rendering-on-the-web#rehydration
[jason-miller]: https://twitter.com/_developit
[addy-osmani]: https://twitter.com/addyosmani

In addition to being benefitial for SEO, this technique makes the client UI to render more quickly into view because the prerendered markup doesn't have to be recreated, [just hydrated](/concepts/client-hydration).

## New to Fastify?

If you're just getting started with Fastify itself, check out Pawel Grzybek's [From Express to Fastify in Node.js
][pawels-article] and Simon Plenderleith's [How To Migrate Your App from Express to Fastify][simons-article]. 

I'd also suggest spending some time getting familiarized with its notion of
[plugins](https://www.fastify.io/docs/latest/Plugins-Guide),
[hooks](https://www.fastify.io/docs/latest/Hooks),
[encapsulation](https://www.fastify.io/docs/latest/Encapsulation) and
[lifecycle](https://www.fastify.io/docs/latest/Lifecycle/), to understand what _the fuss is all about_ and why you should care about going with Fastify for your next Node.js apps.

[pawels-article]: https://pawelgrzybek.com/from-express-to-fastify-in-node-js/
[simons-article]: https://www.sitepoint.com/express-to-fastify-migrate/

::: tip
[Matteo Colina's](https://www.youtube.com/watch?v=FQu8FnTzOR0) and [Simon Plenderleith's](https://simonplend.com/learning-fastify/) video introductions are great if you need a little guidance. 

There's also [this article on VueJSDevelopers]() covering one of the first versions of <b>fastify-vite</b> — it tries to tell a longer story about how this plugin got started.
:::

## New to Vite?

Vite is a <b>build tool</b> with an <b>integrated development server</b>. It is based on [Rollup](https://rollupjs.org/) and leverages <b>ESM support</b> in browsers to enable nearly instant <b>Hot Module Replacement</b>, or as it is popularly known, _hot reload_. [Evan You's Vue Mastery course][evan-course] is possibly the best option if you need more guidance, but its documentation is generally straightforward and Vite itself is rather intuitive to get started with.

Also check out Evan You's [Vite 2.0 announcement][vite-2-announcement] for more background.

[evan-course]: https://www.vuemastery.com/courses/lightning-fast-builds-with-vite/intro-to-vite/
[vite-2-announcement]: https://dev.to/yyx990803/announcing-vite-2-0-2f0a

## Sponsors

<style>
.sponsor { position: relative; display: inline-block; text-decoration: none; }
.sponsor:hover { text-decoration: none; }
.sponsor img { margin-right: 40px; }
</style>
<a class="sponsor" href="https://nearform.com">
<img height="25" src="/nearform.svg" alt="NearForm">
</a>
<a class="sponsor" href="https://helloprint.com">
<img height="25" src="/helloprint.svg" alt="Helloprint">
</a>
<a class="sponsor" href="https://feature.fm" style="height: 35px; width: 180px;">
<img height="35" style="position: absolute; top: 8px; left: 0px" src="/featurefm.svg" alt="Feature.fm">
</a>
<img class="sponsor" width="150" src="/sxdotcom.svg" alt="S​e​x​.com">

See also [acknowledgements](/meta/about.html#acknowledgements).