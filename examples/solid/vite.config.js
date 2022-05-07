import { join, dirname } from 'path'
import viteSolid from 'vite-plugin-solid'
import { viteESModuleSSR } from 'fastify-vite'

let dev = false

// @type {import('vite').UserConfig}
export default {
  root: join(dirname(new URL(import.meta.url).pathname), 'client'),
  plugins: [
    viteSolid({ ssr: true }),
    viteESModuleSSR(),
    {
      name: 'debugging',
      config (_, { mode }) {
        if (mode === 'development') {
          dev = true
          console.log('dev = true')
        }
      },
      resolveId(id) {
        process._rawDebug(id)
      }
    },
  ]
}
