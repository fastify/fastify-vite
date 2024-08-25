import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte as viteSvelte } from '@sveltejs/vite-plugin-svelte'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  viteSvelte()
]

export default {
  root,
  plugins
}
