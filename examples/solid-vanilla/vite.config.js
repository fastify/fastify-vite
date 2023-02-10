import { join } from 'node:path'
import viteSolid from 'vite-plugin-solid'

const root = join(process.cwd(), 'client')

const plugins = [
  viteSolid({ ssr: true }),
]

export default {
  root,
  plugins
}
