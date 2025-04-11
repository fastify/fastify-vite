import { join } from 'node:path'
import viteFastifyVue from '@fastify/vue/plugin'
import viteVue from '@vitejs/plugin-vue'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteFastifyVue({
      locales: ['en', 'sv', 'da'], // The first locale is the default
      localePrefix: true,
    }),
    viteVue(),
  ],
}
