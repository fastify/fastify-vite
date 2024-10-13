import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import { svelte as viteSvelte } from '@sveltejs/vite-plugin-svelte'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [
    viteFastify(),
    viteSvelte({
      compilerOptions: {
        hydratable: true,
      },
    }),
  ],
}
