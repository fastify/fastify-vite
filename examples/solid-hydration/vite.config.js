import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import viteSolid from 'vite-plugin-solid'

const path = fileURLToPath(import.meta.url)
const root = resolve(dirname(path), 'client')

const plugins = [
  viteSolid({ ssr: true })
]

const ssr = {
  noExternal: ['@solidjs/router']
}

export default {
  root,
  plugins,
  ssr
}
