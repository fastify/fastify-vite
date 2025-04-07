import { join } from 'node:path'
import viteFastifyVue from '@fastify/vue/plugin'
import viteVue from '@vitejs/plugin-vue'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteFastifyVue({
      defaultLocale: 'en',
      localePrefix: false,
      localeDomains: {
        'da': '127.0.0.1:3001', // Danish pages are constrained to this domain/host
      },
    }),
    viteVue(),
  ],
}
