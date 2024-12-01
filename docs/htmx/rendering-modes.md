# Rendering modes

[Route modules](/vue/route-modules)'s default rendering mode is **Seamless SSR to CSR**, akin to **Next.js** and **Nuxt.js**), but it can be customized as follows.

## Server only

If a route module exports `serverOnly` set to `true`, only SSR will take place.

The client gets the server-side rendered markup without any accompanying JavaScript or data hydration.

You should use this setting to deliver lighter pages when there's no need to run any code on them, such as statically generated content sites.

```vue
export const serverOnly = true

export function Index () {
  return <p>No JavaScript sent to the browser.</p>
}
```

[This example](https://github.com/fastify/fastify-vite/blob/dev/starters/react-kitchensink/client/pages/server-only.jsx) is part of the [react-kitchensink](https://github.com/fastify/fastify-vite/tree/dev/starters/react-kitchensink) starter template.

## Client only

If a route module exports `clientOnly` set to `true`, no SSR will take place, only data fetching and data hydration. The client gets the empty container element (the one that wraps `<!-- element -->` in `index.html`) and all rendering takes place on the client only.

You can use this setting to save server resources on internal pages where SSR makes no significant diference for search engines or UX in general, such as a password-protected admin section.

```vue
export const clientOnly = true

export function Index () {
  return <p>No pre-rendered HTML sent to the browser.</p>
}
```

[This example](https://github.com/fastify/fastify-vite/blob/dev/starters/react-kitchensink/client/pages/client-only.jsx) is part of the [react-kitchensink](https://github.com/fastify/fastify-vite/tree/dev/starters/react-kitchensink) starter template.

## Streaming

If a route module exports `streaming` set to `true`, SSR will take place in **streaming mode**. That means if you have components depending on asynchronous resources and `<Suspense>` sections with defined fallback components, they will be streamed right way while the resources finish processing.

```jsx
import React, { Suspense } from 'react'

export const streaming = true

export default function Index () {
  return (
    <Suspense fallback={<p>Waiting for content</p>}>
      <Message />
    </Suspense>
  )
}

function Message () {
  const message = afterSeconds({
    id: 'index',
    message: 'Delayed by Suspense API',
    seconds: 5
  })
  return <p>{message}</p>
}
```

[This example](https://github.com/fastify/fastify-vite/blob/dev/starters/react-kitchensink/client/pages/streaming.jsx) is part of the [react-kitchensink](https://github.com/fastify/fastify-vite/tree/dev/starters/react-kitchensink) starter template.


