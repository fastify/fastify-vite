import { dirname } from 'node:path'

export default {
  root: dirname(new URL(import.meta.url).pathname),
  server: {
    hmr: false,
  }
}
