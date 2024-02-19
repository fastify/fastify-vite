import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

let port = 7981

export default () => ({
  root: dirname(fileURLToPath(new URL(import.meta.url))),
  server: {
    hmr: {
      port: port++,
    },
  },
})
