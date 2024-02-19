const views = import.meta.glob('/views/**/*.{js,ts,jsx,tsx}', { eager: true })
const fragments = import.meta.glob('/fragments/**/*.{js,ts,jsx,tsx}', {
  eager: true,
})

const routeHash = { ...views, ...fragments }

for (const [path] of Object.entries(routeHash)) {
  routeHash[path] = { ...routeHash[path] }
  routeHash[path].modulePath = path
  if (path.includes('/fragments/')) {
    routeHash[path].fragment = true
  }
}

export const routes = Object.values(routeHash)
