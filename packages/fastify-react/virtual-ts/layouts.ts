import { lazy } from 'react'

const DefaultLayout = () => import('$app/layouts/default.tsx')

const appLayouts = import.meta.glob('/layouts/*.{jsx,tsx}')

if (
  !Object.keys(appLayouts).some((path) =>
    path.match(/\/layouts\/default\.(j|t)sx/),
  )
) {
  appLayouts['/layouts/default.tsx'] = DefaultLayout
}

export default Object.fromEntries(
  Object.keys(appLayouts).map((path) => {
    const name = path.slice(9, -4)
    return [name, lazy(appLayouts[path])]
  }),
)
