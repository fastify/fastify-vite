import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import inject from '@rollup/plugin-inject'

export default {
  root: dirname(new URL(import.meta.url).pathname),
  esbuild: {
    jsxFactory: 'Html.createElement',
    jsxFragment: 'Html.Fragment',
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
