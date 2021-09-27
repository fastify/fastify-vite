# Global Data

You can easily make data from the server <b>globally available</b> (and properly [client hydrated](/internals/client-hydration)) by simply assigning to `fastify.vite.global`:

```js
fastify.vite.global = { foobar: 123 }
```

This object is made available to requests as `req.$global`.

And **serialized** to the HTML document as `window[Symbol.for('kGlobal')]` for hydration.

This can be used, for instance, to serialize public `process.env` variables to the client.

Access to it is <b>isomorphic</b> in both <b>fastify-vite-vue</b> and <b>fastify-vite-react</b>.

## Vue

Global Data is automaticallyed added to [`globalProperties`][global-properties] as `$global`.

[global-properties]: https://v3.vuejs.org/api/application-config.html#globalproperties

```vue
<template>
  <h2>Accessing global data from the server</h2>
  <p>{{ $global }}</p>
</template>
```

You can also access it via the context object returned by the `useHydration()` hook.

```vue
<template>
  <h2>Accessing global data from the server</h2>
  <p>{{ foobar }}</p>
</template>

<script>
import { useHydration } from 'fastify-vite-vue/client'

export const path = '/global-data'

export default {
  async setup () {
    const ctx = await useHydration()
    return { foobar: ctx.$global }
  }
}
</script>
```

## React

Global Data is available through via the context object returned by the `useHydration()` hook.

```jsx
import { useHydration } from 'fastify-vite-react/client'

export const path = '/global-data'

export default function GlobalData (props) {
  const [ctx] = useHydration()
  return (
    <>
      <h2>Accessing global data from the server</h2>
      <p>{JSON.stringify(ctx.$global)}</p>
    </>
  )
}
```