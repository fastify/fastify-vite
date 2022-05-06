import { join, dirname } from 'path'
import viteReactRefresh from '@vitejs/plugin-react-refresh'
import { viteESModuleSSR } from 'fastify-vite'

// @type {import('vite').UserConfig}
export default {
  root: join(dirname(new URL(import.meta.url).pathname), 'client'),
  plugins: [
    viteReactRefresh(),
    viteESModuleSSR(),
  ],
}
