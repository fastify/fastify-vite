
## Virtual Modules

**Fastify DX** relies on [virtual modules](https://github.com/rollup/plugins/tree/master/packages/virtual) to save your project from having too many boilerplate files. Virtual modules are a [Rollup](https://rollupjs.org/guide/en/) feature exposed and fully supported by [Vite](https://vitejs.dev/). When you see imports that start with `/dx:`, you know a Fastify DX virtual module is being used.

Fastify DX virtual modules are **fully ejectable**. For instance, the starter template relies on the `/dx:root.jsx` virtual module to provide the React Router shell of your application. If you copy the `root.jsx` file [from the @fastify/react package](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/root.jsx) and place it your Vite project root, **that copy of the file is used instead**. In fact, the starter template already comes with a custom `root.jsx` of its own to include UnoCSS.

Aside from `root.jsx`, the starter template comes with two other virtual modules already ejected and part of the local project — `context.js` and `layouts/default.jsx`. If you don't need to customize them, you can safely removed them from your project.

### `/dx:root.jsx`

This is the root React component. It's used internally by `/dx:create.jsx` and provided as part of the starter template. You can use this file to add a common layout to all routes, or just use it to add additional, custom context providers.

The version provided as part of the starter template includes [UnoCSS](https://github.com/unocss/unocss)'s own virtual module import, necessary to enable its CSS engine.

```jsx
import 'virtual:uno.css'
import { Suspense } from 'react'
import { DXApp } from '/dx:core.jsx'

export default function Root ({ url, serverInit }) {
  return (
    <Suspense>
      <DXApp url={url} {...serverInit} />
    </Suspense>
  )
}
```

Note that a top-level `<Suspense>` wrapper is necessary because Fastify DX has code-splitting enabled at the route-level. You can opt out of code-splitting by providing your own `routes.js` file, but that's very unlikely to be ever required for any reason.

### `/dx:routes.js`

Fastify DX has **code-splitting** out of the box. It does that by eagerly loading all route data on the server, and then hydrating any missing metadata on the client. That's why the routes module default export is conditioned to `import.meta.env.SSR`, and different helper functions are called for each rendering environment.

```js
export default import.meta.env.SSR
  ? createRoutes(import.meta.globEager('$globPattern'))
  : hydrateRoutes(import.meta.glob('$globPattern'))
```

See [the full file](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/routes.js) for the `createRoutes()` and `hydrateRoutes()` definitions. 

If you want to use your own custom routes list, you must eject this file as-is and replace the glob imports with your own routes list:

```js
const routes = [
  { 
    path: '/', 
    component: () => import('/custom/index.jsx'),
  }
]

export default import.meta.env.SSR
  ? createRoutes(routes)
  : hydrateRoutes(routes)
````

### `/dx:core.jsx`

Implements `useRouteContext()`, `DXApp` and `DXRoute`. 

`DXApp` is imported by `root.jsx` and encapsulates Fastify DX's route component API.

> React Router's [nested routes](https://reactrouter.com/docs/en/v6/getting-started/concepts#nested-routes) aren't supported yet.

See its full definition [here](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/core.jsx).

### `/dx:create.jsx`

This virtual module creates your root React component. 

This is where `root.jsx` is imported.

<b>You'll rarely need to customize this file.</b>

```jsx
import Root from '/dx:root.jsx'

export default function create ({ url, ...serverInit }) {
  return (
    <Root url={url} serverInit={serverInit} />
  )
}
```

What you see above is its [full definition](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/create.jsx).

### `/dx:layouts.js`

This is responsible for loading **layout components**. It's used internally by `/dx:core.jsx`. If a project has no `layouts/default.jsx` file, the default one from Fastify DX is used. This virtual module works in conjunction with the `/dx:layouts/` virtual module which provides exports from the `/layouts` folder.

<b>You'll rarely need to customize this file.</b>

```jsx
import { lazy } from 'react'

const DefaultLayout = () => import('/dx:layouts/default.jsx')

const appLayouts = import.meta.glob('/layouts/*.jsx')

appLayouts['/layouts/default.jsx'] ??= DefaultLayout

export default Object.fromEntries(
  Object.keys(appLayouts).map((path) => {
    const name = path.slice(9, -4)
    return [name, lazy(appLayouts[path])]
  })
)
```

What you see above is its [full definition](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/layouts.js).

### `/dx:mount.js`

This is the file `index.html` links to by default. It sets up the application with an `unihead` instance for head management, the initial route context, and provides the conditional mounting logic to defer to CSR-only if `clientOnly` is enabled.

<b>You'll rarely need to customize this file.</b>

[See the full file](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/mount.js) for the `mount()` function definition.

### `/dx:resource.js`

Provides the `waitResource()` and `waitFetch()` data fetching helpers implementing the [Suspense API](https://17.reactjs.org/docs/concurrent-mode-suspense.html). They're used by `/dx:core.jsx`.

<b>You'll rarely need to customize this file.</b>

See its full definition [here](https://github.com/fastify/fastify-dx/blob/main/packages/fastify-react/virtual/resource.js).
