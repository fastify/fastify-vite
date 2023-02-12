import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default {
  root: dirname(fileURLToPath(new URL(import.meta.url))),
  server: {
    hmr: false
  }
}
