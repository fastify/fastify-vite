::: tip
In Nuxt.js and Next.js, the server is hidden away in the framework, extremely tailored to fulfill their needs. For reference look at [`next-server.ts`][next-server.ts] and [`server.js`][nuxt-server.js]. If you want to extend the Nuxt.js internal server you have to resort to [`serverMiddleware`](https://nuxtjs.org/docs/configuration-glossary/configuration-servermiddleware/), while Next.js tries to automate the ordeal a little by [mapping files](https://nextjs.org/docs/api-routes/introduction) from `pages/api/` to `/api/` endpoints automatically. Both Nuxt.js and Next.js use the middleware functions popularized by [Express][express-js], [Koa][koa-js], [Connect][connect-js] etc — with no notion of decorators, hooks or encapsulation like Fastify.
:::

[next-server.ts]: https://github.com/vercel/next.js/blob/canary/packages/next/server/next-server.ts
[nuxt-server.js]: https://github.com/nuxt/nuxt.js/blob/dev/packages/server/src/server.js#L2

[express-js]: https://expressjs.com/
[koa-js]: https://koajs.com/
[connect-js]: https://github.com/senchalabs/connect
