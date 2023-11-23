<!--@include: ../guide/parts/links.md-->

# Router Setup

By default, routes are loaded from the `<project-root>/pages` folder, where `<project-root>` refers to the `root` setting in your Vite configuration file. 

The route paths are **dynamically inferred from the directory structure**, very much like **Next.js**, and passed to the **React Router** instance in `/:create.js`

Alternatively, you can also export a `path` constant from your route modules, in which case it will be used to **override the dynamically inferred paths**:

```jsx
export const path = '/my-page'

export defaut function MyPage () {
  return <p>Route with path export</p>
}
```

## Routes location

You can also change the glob pattern used to determine where to route modules from. Internally, this setting is passed to [Vite's glob importer](https://vitejs.dev/guide/features.html#glob-import).

In your Vite configuration file:

```js
import viteFastifyReact from '@fastify/react/plugin'

export default {
  plugins: [
    // ...
    viteFastifyReact({ globPattern: '/views/**/*.vue' }),
  ]
}
```

## Dynamic parameters

Dynamic route parameters follow the [Next.js convention](https://nextjs.org/docs/basic-features/pages#pages-with-dynamic-routes) (`[param]`), but that can be overriden by using the `paramPattern` plugin option. For example, this configuration switches the param pattern to the [Remix convention](https://remix.run/docs/en/v1/guides/routing#dynamic-segments) (`$param`).

In your Vite configuration file:

```js
import viteFastifyReact from '@fastify/react/plugin'

export default {
  plugins: [
    // ...
    viteFastifyReact({ paramPattern: /\$(\w+)/ }),
  ],
}
```

