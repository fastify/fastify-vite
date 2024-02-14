const DefaultLayout = () => import('/:layouts/default.jsx')

const appLayouts = import.meta.glob('/layouts/*.{jsx,tsx}', {
  eager: true,
  import: 'default',
})

if (
  !Object.keys(appLayouts).some((path) =>
    path.match(/\/layouts\/default\.(j|t)sx/),
  )
) {
  appLayouts['/layouts/default.jsx'] = DefaultLayout
}

export default Object.fromEntries(
  Object.keys(appLayouts).map((path) => {
    // Filename without extension
    const name = path.slice(9, -4)
    return [name, appLayouts[path]]
  }),
)
