import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { viteFastify } from '@fastify/vite'
import viteSolid from 'vite-plugin-solid'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  viteFastify(),
  viteSolid({ ssr: true })
]

export default {
  root,
  plugins
}
