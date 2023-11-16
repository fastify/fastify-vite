
# Rendering modes

Following the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md), Fastify DX's route modules can be set for universal rendering (SSR + CSR hydration, the default behavior), SSR in streaming mode, SSR only (client gets no JavaScript) or CSR only (SSR fully disabled).

## `streaming`

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

[See the full example](https://github.com/fastify/fastify-dx/blob/main/starters/react/client/pages/streaming.jsx) in the [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/react).


## `serverOnly`

If a route module exports `serverOnly` set to `true`, only SSR will take place. The client gets the server-side rendered markup without any accompanying JavaScript or data hydration.

You should use this setting to deliver lighter pages when there's no need to run any code on them, such as statically generated content sites.

This differs from [React Server Components](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md), which are also supported, but whose server-only rendering is more granular (available for any route child component) and fully controlled by React.

```jsx
export const serverOnly = true
  
export function Index () {
  return <p>No JavaScript sent to the browser.</p>
}
```

[This example](https://github.com/fastify/fastify-dx/blob/main/starters/react/client/pages/server-only.jsx) is part of the [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/react).

## `clientOnly`

If a route module exports `clientOnly` set to `true`, no SSR will take place, only data fetching and data hydration. The client gets the empty container element (the one that wraps `<!-- element -->` in `index.html`) and all rendering takes place on the client only.

You can use this setting to save server resources on internal pages where SSR makes no significant diference for search engines or UX in general, such as a password-protected admin section.

This differs from [React Client Components](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md), which are also supported, but rendering is more granular (available for any route child component) and fully controlled by React.

```jsx
export const clientOnly = true
  
export function Index () {
  return <p>No pre-rendered HTML sent to the browser.</p>
}
```

[This example](https://github.com/fastify/fastify-dx/blob/main/starters/react/client/pages/client-only.jsx) is part of the [starter template](https://github.com/fastify/fastify-dx/tree/dev/starters/react).

