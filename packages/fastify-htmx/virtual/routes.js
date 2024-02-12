const views = import.meta.glob('/views/**/*.jsx', { eager: true })
const parts = import.meta.glob('/parts/**/*.jsx', { eager: true })

const routeHash = { ...views, ...parts }

for (const [path] of Object.entries(routeHash)) {
  routeHash[path] = { ...routeHash[path] }
  routeHash[path].modulePath = path
}

export const routes = Object.values(routeHash)
