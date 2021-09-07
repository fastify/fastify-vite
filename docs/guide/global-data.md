# Global Data

You can easily make data from the server <b>globally available</b>b> (and properly client hydrated) by simply assigning to `fastify.vite.global`:

```js
fastify.vite.global = { foobar: 123 }
```

This object will be serialized into the HTML document as `window[kGlobal]`

## Vue

```vue
<template>
  <h2>Accessing global data from the server</h2>

  <!-- Global Data comes from req.$global and it's already injected as globalProperties -->
  <p>{{ $global }}</p>

  <!-- You can also access it from setup() via useHydration() and make it available in other ways -->
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