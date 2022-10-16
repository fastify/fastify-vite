import { resolve, dirname } from 'path'
import { svelte as viteSvelte } from '@sveltejs/vite-plugin-svelte'
import viteFastify from 'fastify-vite/plugin'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  viteSvelte(),
  viteFastify()
]

export default {
  root,
  plugins
}
