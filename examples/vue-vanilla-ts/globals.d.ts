
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@fastify/vite/plugin' {
  const fastifyVitePlugin: () => import('vite').Plugin
  export default fastifyVitePlugin
}
