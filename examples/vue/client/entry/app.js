import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import App from './app.vue'
import Index from '../index.vue'

const createHistory = import.meta.env.SSR
  ? createMemoryHistory
  : createWebHistory

export async function createApp (ctx) {
  const app = createSSRApp(App)
  const router = createRouter({
    history: createHistory(),
    routes: [
      { path: '/', component: Index },
    ],
  })
  app.use(router)
  return { ctx, app, router }
}
