

# Rendering modes

[Route modules](/vue/route-modules)'s default rendering mode is **Seamless SSR to CSR**, akin to **Nuxt.js** and **Next.js**), but it can be customized as follows.

## Server only

If a route module exports `serverOnly` set to `true`, only SSR will take place. 

The client gets the server-side rendered markup without any accompanying JavaScript or data hydration.

You should use this setting to deliver lighter pages when there's no need to run any code on them, such as statically generated content sites.

```vue
<template>
  <p>This route is rendered on the server only!</p>
</template>

<script>
export const serverOnly = true
</script>
```

[This example](https://github.com/fastify/fastify-vite/blob/dev/starters/vue-kitchensink/client/pages/server-only.vue) is part of the [vue-kitchensink](https://github.com/fastify/fastify-vite/tree/dev/starters/vue-kitchensink) starter template.

## Client only

If a route module exports `clientOnly` set to `true`, no SSR will take place, only data fetching and data hydration. The client gets the empty container element (the one that wraps `<!-- element -->` in `index.html`) and all rendering takes place on the client only.

You can use this setting to save server resources on internal pages where SSR makes no significant diference for search engines or UX in general, such as a password-protected admin section.

```vue
<template>
  <p>This route is rendered on the client only!</p>
</template>

<script>
export const clientOnly = true
</script>
```

[This example](https://github.com/fastify/fastify-vite/blob/dev/starters/vue-kitchensink/client/pages/client-only.vue) is part of the [vue-kitchensink](https://github.com/fastify/fastify-vite/tree/dev/starters/vue-kitchensink) starter template.

## Streaming

If a route module exports `streaming` set to `true`, SSR will take place in **streaming mode**. That means the result of all server-side rendering gets streamed as it takes place, even if you have asynchronous Vue components. Note that differently from React, Vue **will not** stream a Suspense block's `#fallback` template.

```vue
<template>
  <Message :secs="2" />
  <Message :secs="4" />
  <Message :secs="6" />
</template>

<script>
import Message from '/components/Message.vue'

export const streaming = true

export default {
  components: { Message },
}
</script>
```

[This example](https://github.com/fastify/fastify-vite/blob/dev/starters/vue-kitchensink/client/pages/streaming.vue) is part of the [vue-kitchensink](https://github.com/fastify/fastify-vite/tree/dev/starters/vue-kitchensink) starter template.


