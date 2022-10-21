
## Background

The late 2010s saw the dawn of the age of the **SSR framework**. Since **server-side rendering** (SSR) is just [too complex and often requires a great deal of preparation](https://hire.jonasgalvez.com.br/2022/apr/30/a-gentle-introduction-to-ssr/) to get right — starting from the fact that people (to this date!) [still disagree](https://news.ycombinator.com/item?id=31224226) on what SSR actually is<sup>**[1]**</sup>, specialized frameworks started appearing to meet the inevitable demand for tools that spared developers of the boilerplate work and let them jump straight into their application code, without caring for underlying implementation details. 

> **[1]** SSR in this context refers to the server-side rendering **of client-side JavaScript** to produce on the server the same markup that is dynamically rendered by the browser, so client-side JavaScript doesn't have to spend time rendering the same fragment twice.

First came [Next.js](https://nextjs.org/) (React) and [Nuxt.js](https://nuxtjs.org/) (Vue) back in 2016, and in recent times, [SvelteKit](https://kit.svelte.dev/) (Svelte) and [Remix](https://remix.run/) (React). There are many others, but presently these are the ones that have amassed the largest user bases. 

Between 2018 and 2020 I was a core contributor to Nuxt.js and acquired a deep understanding of the complexities and challenges involved. 

At some point in between debugging server integration and SSR performance issues in my Nuxt.js applications, it ocurred to me that for optimal performance, safety and flexibility, frameworks [would be better off](https://hire.jonasgalvez.com.br/2022/may/02/the-thing-about-fastify/) building on top of [Fastify](https://fastify.io/) rather than trying to incorporate their own backend mechanics with built-in Express-like servers. 

That's when I started working on [fastify-vite](https://github.com/fastify/fastify-vite), a Fastify plugin to integrate with [Vite](https://vitejs.dev/)-bundled client applications. At least Nuxt.js and SvelteKit seem to agree that building on top of Vite is a good idea — the Vite ecosystem is a solid base for addressing a lot of core, foundational aspects of frameworks, not only bringing a lot of flexibility to the build process (through Vite plugins), but also providing developer experience features such as **hot module reload**.

After many iterations, [fastify-vite]() evolved to become a highly configurable approach for integrating Vite within Fastify applications. Focusing now on architectural primitives, such as dependency injection and route registration, it's conceivably feasible to reimplement any framework with it. To demonstrate this level of flexibility, I [reimplemented two Next.js essential features for both React and Vue](https://hire.jonasgalvez.com.br/2022/may/18/building-a-mini-next-js/).

> “Simplicity is a great virtue but it requires hard work to achieve it and education to appreciate it. And to make matters worse: complexity sells better.” ― Edsger W. Dijkstra

The one thing **[fastify-vite](https://github.com/fastify/fastify-vite)** doesn't do is provide an API out of the box for how route modules can control HTML shell, rendering and data fetching aspects of an individual web page. It provides you with an API to implement your own. That's an area that will be addressed by the upcoming [**Fastify DX**](https://github.com/fastify/fastify-dx) toolset.
