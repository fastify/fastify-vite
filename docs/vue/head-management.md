<!--@include: ../guide/parts/links.md-->

# Head Management

Following the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md), Fastify DX renders `<head>` elements independently from the SSR phase. This allows you to fetch data for populating the first `<meta>` tags and stream them right away to the client, and only then perform SSR.

> Additional `<link>` preload tags can be produced from the SSR phase. This is **not currently implemented** in this **alpha release** but is a planned feature. If you can't wait for it, you can roll out your own (and perhaps contribute your solution) by providing your own [`createHtmlFunction()`](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/index.js#L57) to [@fastify/vite](https://github.com/fastify/fastify-vite).

### `getMeta()`

To populate `<title>`, `<meta>` and `<link>` elements, export a `getMeta()` function that returns an object matching the format expected by [unihead](https://github.com/galvez/unihead), the underlying library used by Fastify DX.
  
It receives the [route context](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/README.md#route-context) as first parameter and runs after `getData()`, allowing you to access any `data` populated by these other functions to generate your tags.

```vue
<template>
  <p>Route with meta tags.</p>
</template>

<script>
export function getMeta (ctx) {
  return {
    title: 'Route Title',
    meta: [
      { name: 'twitter:title', value: 'Route Title' },
    ]
  }
}
</script>
```
