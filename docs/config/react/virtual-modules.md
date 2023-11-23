# Virtual Modules

As covered in [Project Structure](/react/project-structure#smart-links), **`@fastify/react`** relies on [virtual modules](https://github.com/rollup/plugins/tree/master/packages/virtual) to save your project from having too many boilerplate files. Virtual modules used in **`@fastify/react`** are **fully ejectable**. For instance, the starter template relies on the `/:root.jsx` virtual module to provide the React component shell of your application. If you copy the `root.jsx` file [from the @fastify/react package](https://github.com/fastify/fastify-vite/blob/main/packages/fastify-react/virtual/root.jsx) and place it your Vite project root, **that copy of the file is used instead**.

## `/:root.jsx`

This is the root React component. It's used internally by `/:create.jsx` and provided as part of the starter template. You can use this file to add a common layout to all routes, or just use it to add additional, custom context providers.

Note that a top-level `<Suspense>` wrapper is necessary because **`@fastify/react`** has code-splitting enabled at the route-level. You can opt out of code-splitting by providing your own `routes.js` file, but that's very unlikely to be ever required for any reason.

#### Source from `packages/fastify-react/virtual/root.jsx`:

<<< @../../packages/fastify-react/virtual/root.jsx

## `/:routes.js`

**`@fastify/react`** has **code-splitting** out of the box. It does that by eagerly loading all route data on the server, and then hydrating any missing metadata on the client. That's why the routes module default export is conditioned to `import.meta.env.SSR`, and different helper functions are called for each rendering environment.

> React Router's [nested routes](https://reactrouter.com/docs/en/v6/getting-started/concepts#nested-routes) aren't supported yet.


#### Source from `packages/fastify-react/virtual/routes.js`:

<<< @../../packages/fastify-react/virtual/routes.js

## `/:core.jsx`

Implements `useRouteContext()`, `App` and `AppRoute`. 

`App` is imported by `root.jsx` and encapsulates **`@fastify/react`**'s route component API.

#### Source from `packages/fastify-react/virtual/core.jsx`:

<<< @../../packages/fastify-react/virtual/core.jsx

## `/:create.jsx`

This virtual module creates your root React component. 

This is where `root.jsx` is imported.

#### Source from `packages/fastify-react/virtual/create.jsx`:

<<< @../../packages/fastify-react/virtual/create.jsx

## `/:layouts/default.js`

This is used internally by `/:core.jsx`. If a project has no `layouts/default.jsx` file, the default one from **`@fastify/react`** is used.

#### Source from `packages/fastify-react/virtual/layouts/default.jsx`:

<<< @../../packages/fastify-react/virtual/layouts/default.jsx

## `/:mount.js`

This is the file `index.html` links to by default. It sets up the application with an `unihead` instance for head management, the initial route context, and provides the conditional mounting logic to defer to CSR-only if `clientOnly` is enabled.

#### Source from `packages/fastify-react/virtual/mount.js`:

<<< @../../packages/fastify-react/virtual/mount.js

## `/:resource.js`

Provides the `waitResource()` and `waitFetch()` data fetching helpers implementing the [Suspense API](https://17.reactjs.org/docs/concurrent-mode-suspense.html). They're used by `/:core.jsx`.

#### Source from `packages/fastify-react/virtual/resource.js`:

<<< @../../packages/fastify-react/virtual/resource.js
