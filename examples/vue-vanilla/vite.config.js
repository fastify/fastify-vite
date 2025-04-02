import { join } from 'node:path'
import viteFastify from '@fastify/vite/plugin'
import vuePlugin from '@vitejs/plugin-vue'

export default {
  root: join(import.meta.dirname, 'client'),
  plugins: [viteFastify(), vuePlugin()],
  environments: {
    client: {
      build: {
        outDir: 'dist/client',
        minify: false,
        sourcemap: true,
        manifest: true,
      },
    },
    server: {
      build: {
        outDir: 'dist/server',
        sourcemap: true,
        ssr: true,
        emitAssets: true,
        manifest: true,
        rollupOptions: {
          input: {
            index: '/client/index.js',
          },
        },
      },
    }
  }
}

