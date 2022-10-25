import { resolve, dirname } from 'path'
import viteSolid from 'vite-plugin-solid'

const path = new URL(import.meta.url).pathname
const root = resolve(dirname(path), 'client')

const plugins = [
  viteSolid({ ssr: true }),
]

const ssr = {
  noExternal: ['solid-app-router'],
}

export default {
  root,
  plugins,
  ssr
}
