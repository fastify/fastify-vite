import { resolve, dirname } from 'path'
import { svelte as viteSvelte } from '@sveltejs/vite-plugin-svelte'
import { ensureESMBuild } from '@fastify/vite'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  viteSvelte({
    compilerOptions: {
      hydratable: true,
    }
  }),
  ensureESMBuild()
]

export default {
  root,
  plugins
}
