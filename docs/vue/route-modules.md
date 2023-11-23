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

**`@fastify/vue`** implements the `getServerSideProps()` style of data fetching via the `getData()` route module export. 

It will run server-side before any SSR takes place, so any data fetched is made available to the route component (on the [route context](/vue/route-context)) before it even starts to render. During first render, any data retrieved on the server is automatically sent to the client for hydration, as part of the the route context.

During client-side navigation (post first-render), a JSON request is fired to an internal endpoint **automatically registered** by `@fastify/vite` for running the `getData()` function for that route on the server, exactly the same way `getServerSideProps()` works in **Next.js**.

The objet returned by `getData()` gets automatically assigned as `data` in the [universal route context](/vue/route-context) object and is accessible from `getMeta()` and `onEnter()` functions and also via the `useRouteContext()` hook.

```vue
<template>
  <p>{data.message}</p>
</template>

<script>
import { useRouteContext } from '/:core.js'

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

**`@fastify/vue`** renders `<head>` elements **independently** from SSR. This allows you to fetch data for populating `<meta>` tags first, stream them right away to the client, and only then perform SSR.

> Under the hood, it uses the [`unihead`](https://github.com/galvez/unihead) library, which has a SSR function and a browser library that allows for dynamic changes during client-side navigation. This is a very small library built specifically for `@fastify/vite` core renderers, and used in the current implementation of `createHtmlFunction()` for `@fastify/vue`. This may change in the futuree as other libraries are considered, but for most use cases it should be enough.

To populate `<title>`, `<meta>` and `<link>` elements, export a `getMeta()` function that returns an object matching the interface expected by [unihead](https://github.com/galvez/unihead):

```ts
interface RouteMeta {
  title?: string | null,
  html?: Record<string, string> | null
  body?: Record<string, string> | null
  meta?: Record<string, string>[] | null,
  link?: Record<string, string>[] | null,
}
```

It receives the [route context](/vue/route-context) as first parameter and runs right after `getData()`, giving you access to `data` when generate your tags. 

It will populate the `head` object in the [route context](/vue/route-context).

```vue
<template>
  <p>Route with meta tags.</p>
</template>

<script>
export function getData () {
  return {
    page: {
      title: 'Page title',
    }
  }
}

export function getMeta (ctx) {
  return {
    title: ctx.data.page.title,
    meta: [
      { name: 'twitter:title', value: ctx.data.page.title },
    ]
  }
}
</script>
```

## The onEnter event

The `onEnter()` function export is executed **just before** the route renders, **both in SSR and during client-side navigation**. That is, the first time a route renders on the server, `onEnter()` runs on the server. Then, since it already ran on the server, **it doesn't run again on the client for that first route**. But if you navigate to another route on the client using `<router-link>`, it triggered again.

It receives the [route context](/vue/route-context) as first parameter, so you can use it to make changes to `data`, `head` and `state` if needed.

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

The snippet above demonstrates how to turn off SSR and downgrade to CSR-only, assuming you have a `pressureHandler` configured in [`underpressure`](https://github.com/fastify/under-pressure) to set a `underPressure` flag on your Fastify server instance.
