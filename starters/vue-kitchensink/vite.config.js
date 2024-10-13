import viteVue from '@vitejs/plugin-vue'
import viteFastify from '@fastify/vite/plugin'
import viteFastifyVue from '@fastify/vue/plugin'

export default {
  root: import.meta.dirname,
  plugins: [
    viteVue(), 
    viteFastify(),
    viteFastifyVue(),
  ],
}
