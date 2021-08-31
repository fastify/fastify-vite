# Motivation

<b>fastify-vite</b> is a key part of a larger initiative called <b>Terix</b>, still in development. Terix will be nothing more than a CLI that is able to recognize a certain set of directory structures and boot Fastify applications with it. Think of it as `nuxt start` or `next start`, without the Nuxt.js or Next.js runtime. Just Fastify and Vite all the way, coupled with the glue code provided by this plugin.

Terix aims to be a framework as CLI, with no tightly coupled runtime. Terix aims to be a set of standard conventions on how to structure a Fastify application with Vite-based frontend code.

Terix was started with the belief that the rise of _mega frameworks_ like Nuxt.js and Next.js has created a tooling ecosystem that compromises encapsulation and composability for the sake of what is now popularly referred to as <b>DX</b>, or, <b>Developer Experience</b>. 