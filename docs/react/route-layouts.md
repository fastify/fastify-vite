# Route Layouts

`@fastify/react` will automatically load layouts from the `layouts/` folder.

By default, the `/:layouts/default.jsx` [**smart import**](/react/project-structure#smart-imports) is used. If a project is missing `/layouts/default.jsx` file, the one provided by the virtual module is automatically used. **The default layout is defined as follows**:

```jsx
import { Suspense } from 'react'

export default function Layout ({ children }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  )
}
```

You assign a layout to a route by exporting `layout`.

```js
export const layout = 'auth'
```

That will cause the route to be wrapped in the layout component exported by a React component placed in `layouts/auth.jsx`. Below is a simple example:

```jsx
import { Suspense } from 'react'
import { useRouteContext } from '/:core.jsx'

export default function Auth ({ children }) {
  const { actions, state, snapshot } = useRouteContext()
  const authenticate = () => actions.authenticate(state)
  return (
    <Suspense>
      {snapshot.user.authenticated
        ? children
        : <Login onClick={() => authenticate()} /> }
    </Suspense>
  )
}

function Login ({ onClick }) {
  return (
    <>
      <p>This route needs authentication.</p>
      <button onClick={onClick}>
        Click this button to authenticate.
      </button>
    </>
  )
}
```

Also you can use `.tsx` extensions for files in layouts folder.

Like route modules, layouts can use `useRouteContext()`.
