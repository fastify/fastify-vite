import { join } from 'node:path'
import viteFastifyVue from '@fastify/vue/plugin'
import viteVue from '@vitejs/plugin-vue'

export default {
  root: join(import.meta.dirname, 'src', 'client'),
  build: {
    emptyOutDir: true,
    outDir: join(import.meta.dirname, 'dist'),
  },
  plugins: [
    viteFastifyVue({
      ts: true,
    }),
    viteVue(),
  ],
}
