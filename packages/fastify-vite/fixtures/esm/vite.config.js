import { createRequire } from 'module'
import { dirname } from 'node:path'

const require = createRequire(import.meta.url)
const viteFastify = require('../../plugin.js')

export default {
  root: dirname(new URL(import.meta.url).pathname),
  plugins: [viteFastify()],
}
