import {
  createMemoryHistory,
  createRouter,
  createWebHistory,
} from 'vue-router'

const views = import.meta.glob('./views/*.vue')

const routes = Object.keys(views).map((path) => {
  const name = path.match(/\.\/views(.*)\.vue$/)[1].toLowerCase()
  return {
    path: name === '/index' ? '/' : name,
    component: views[path],
  }
})

export function getRouter () {
  return createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes,
  })
}
