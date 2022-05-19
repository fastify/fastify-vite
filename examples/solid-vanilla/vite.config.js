import { join, dirname } from 'path'
import viteSolid from 'vite-plugin-solid'
import viteFastify from 'fastify-vite/plugin'

// @type {import('vite').UserConfig}
export default {
  root: join(dirname(new URL(import.meta.url).pathname), 'client'),
  plugins: [
    viteSolid(),
    viteFastify(),
  ],
}
