import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import inject from '@rollup/plugin-inject'

const __dirname = dirname(new URL(import.meta.url).pathname)

export default {
  root: join(__dirname, 'client'),
  esbuild: {
    jsxFactory: 'Html.createElement',
    jsxFragment: 'Html.Fragment',
  },
  optimizeDeps: {
    include: ['/client/**']
  },
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: [
        resolve(__dirname, 'client/client.js'),
        resolve(__dirname, 'client/server.jsx'),
      ],
    },
    rollupOptions: {
      external: ['htmx.org'],
      output: {
        exports: 'named',
      }
    },
  },
  plugins: [
    inject({
      // See https://github.com/bigskysoftware/htmx/issues/1469
       htmx: 'htmx.org',
       // Ensures @kitajs/html availability for JSX
       Html: '@kitajs/html'
    }),
  ],
}
