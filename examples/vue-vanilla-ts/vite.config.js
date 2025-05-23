import { resolve } from 'node:path'
import viteFastifyPlugin from '@fastify/vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'

export default {
  root: resolve(import.meta.dirname, 'src', 'client'),
  plugins: [
    viteFastifyPlugin(),
    vuePlugin(),
  ],
  build: {
    // Forces Vite to use a top-level dist folder,
    // outside the project root defined above
    outDir: resolve(import.meta.dirname, 'build'),
    emptyOutDir: true,
  }
}
