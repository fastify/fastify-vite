
## Route Layouts

Fastify DX will automatically load layouts from the `layouts/` folder. By default, `/dx:layouts/default.jsx` is used — that is, if a project is missing a `layouts/defaults.jsx` file, the one provided by Fastify DX is used instead. 

See the section on [Virtual Modules](https://github.com/fastify/fastify-dx/blob/main/docs/react/virtual-modules.md) to learn more about this.

You assign a layout to a route by exporting `layout`. 

See [`pages/using-auth.jsx`](https://github.com/fastify/fastify-dx/blob/main/starters/react/pages/using-auth.jsx) in the starter template:

```js
export const layout = 'auth'
```

That'll will cause the route to be wrapped in the layout component exported by [`layouts/auth.jsx`](https://github.com/fastify/fastify-dx/blob/main/starters/react/layouts/auth.jsx):

```jsx
import { Suspense } from 'react'
import { useRouteContext } from '/dx:core.jsx'

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

Note that like routes, it has access to `useRouteContext()`.
