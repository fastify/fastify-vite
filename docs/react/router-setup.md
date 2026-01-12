<!--@include: ../guide/parts/links.md-->

# Router Setup

By default, routes are loaded from the `<project-root>/pages` folder, where `<project-root>` refers to the `root` setting in your Vite configuration file.

The route paths are **dynamically inferred from the directory structure**, very much like **Next.js**, and passed to the **React Router** instance in `$app/create.js`

Alternatively, you can also export a `path` constant from your route modules, in which case it will be used to **override the dynamically inferred paths**:

```jsx
export const path = '/my-page'

export default function MyPage() {
  return <p>Route with path export</p>
}
```

## Routes location

Internally, the route modules location is set via the `$app/routes.js` [virtual module](/react/project-structure#smart-imports), which is defined as follows by default:

```js
export default import.meta.glob('/pages/**/*.{jsx,tsx}')
```

To change the location where routes are loaded from, just place a `routes.js` file at your Vite project's root directory and `@fastify/react/plugin` will automatically recognize it and use it instead.

In your Vite configuration file:

```js
import viteFastifyReact from '@fastify/react/plugin'

export default {
  plugins: [
    // ...
    viteFastifyReact({ globPattern: '/views/**/*.tsx' }),
  ],
}
```

## Dynamic parameters

Dynamic route parameters uses `[param]` for a singular parameter and `[param+]` for wildcard routes.
