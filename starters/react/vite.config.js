import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

import viteReact from '@vitejs/plugin-react'
import fastifyReact from '@fastify/react/plugin'
import unocss from 'unocss/vite'

const path = fileURLToPath(import.meta.url)

const root = join(dirname(path), 'client')
const plugins = [
  viteReact({ 
    // Necessary until this Vite issue is resolved:
    // https://github.com/vitejs/vite/issues/3301#issuecomment-1080292430
    fastRefresh: false,
  }), 
  fastifyReact(),
  unocss()
]

export default {
  root,
  plugins,
  ssr: {
    external: [
      'use-sync-external-store'
    ]
  },
}
