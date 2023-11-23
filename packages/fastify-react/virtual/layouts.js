import { lazy } from 'react'

const DefaultLayout = () => import('/:layouts/default.jsx')

const appLayouts = import.meta.glob('/layouts/*.jsx')

appLayouts['/layouts/default.jsx'] ??= DefaultLayout

export default Object.fromEntries(
  Object.keys(appLayouts).map((path) => {
    const name = path.slice(9, -4)
    return [name, lazy(appLayouts[path])]
  }),
)
