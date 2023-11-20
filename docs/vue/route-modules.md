<!--@include: ../guide/parts/links.md-->

# Route Modules

Route modules are Vue components placed under the [route search path](/vue/router-setup#routes-location), set to `<project-root>/pages` by default, or `client/pages` in the starter template, which follows the recommendation of using `client/` as the Vite project root.

Below is a rundown of supported exports:

<table>
<thead>
<tr>
<th>Export</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>

`default`

</td>
<td>

The Vue component.

</td>
</tr>
<tr>
<td>

`getData()`

</td>
<td>

Universal data fetching function, covered in [Data fetching](/vue/route-modules#data-fetching).

</td>
</tr>
<tr>
<td>

`getMeta()`

</td>
<td>

Universal page metadata function, covered in [Page metadata](/vue/route-modules#page-metadata).

</td>
</tr>
<tr>
<td>

`onEnter()`

</td>
<td>

Universal route enter event, covered in [The onEnter event](/vue/route-modules#the-onenter-event).

</td>
</tr>
<tr>
<td>

`clientOnly`

</td>
<td>

Disable server-side rendering.

</td>
</tr>
<tr>
<td>

`serverOnly`

</td>
<td>

Disables cleint-side rendering (ships static markup).

</td>
</tr>
<tr>
<td>

`streaming`

</td>
<td>

Enables **streaming** server-side rendering.

</td>
</tr>
</tbody>
</table>

**Rendering modes** are covered in detail [here](/vue/rendering-modes).

## Data fetching

This hook is set up in a way that it runs server-side before any SSR takes place, so any data fetched is made available to the route component before it starts rendering. During first render, any data retrieved on the server is automatically sent to be hydrated on the client so no new requests are made. Then, during client-side navigation (post first-render), a JSON request is fired to an endpoint automatically registered for running the `getData()` function for that route on the server.

The objet returned by `getData()` gets automatically assigned as `data` in the [universal route context](https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md) object and is accessible from `getMeta()` and `onEnter()` hooks and also via the `useRouteContext()` hook.

```vue
<template>
  <p>{data.message}</p>
</template>

<script>
import { useRouteContext } from '/dx:core.js'

export function getData (ctx) {
  return {
    message: 'Hello from getData!',
  }
}

export default {
  setup () {
    const { data } = useRouteContext()
    return { data }
  }
}
</script>
```

## Page metadata

Following the [URMA specification](https://github.com/fastify/fastify-dx/blob/main/URMA.md), Fastify DX renders `<head>` elements independently from the SSR phase. This allows you to fetch data for populating the first `<meta>` tags and stream them right away to the client, and only then perform SSR.

> Additional `<link>` preload tags can be produced from the SSR phase. This is **not currently implemented** in this **alpha release** but is a planned feature. If you can't wait for it, you can roll out your own (and perhaps contribute your solution) by providing your own [`createHtmlFunction()`](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-vue/index.js#L57) to [@fastify/vite](https://github.com/fastify/fastify-vite).


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

## The onEnter event

If a route module exports a `onEnter()` function, it's executed before the route renders, both in SSR and client-side navigation. That is, the first time a route render on the server, onEnter() runs on the server. Then, since it already ran on the server, it doesn't run again on the client for that first route. But if you navigate to another route on the client using `<Link>`, it runs normally as you'd expect.

It receives the [universal route context][route-context] as first parameter, so you can make changes to `data`, `meta` and `state` if needed.

[route-context]: https://github.com/fastify/fastify-dx/blob/main/docs/vue/route-context.md

```html
<template>
  <p>No pre-rendered HTML sent to the browser.</p>
</template>

<script>
export function onEnter (ctx) {
  if (ctx.server?.underPressure) {
    ctx.clientOnly = true
  }
}
</script>
```

The example demonstrates how to turn off SSR and downgrade to CSR-only, assuming you have a `pressureHandler` configured in [`underpressure`](https://github.com/fastify/under-pressure) to set a `underPressure` flag on your server instance.
