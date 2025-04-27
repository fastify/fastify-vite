import viteFastify from '@fastify/vite/plugin'
import viteReact from '@vitejs/plugin-react'

export default {
  root: import.meta.dirname,
  plugins: [
    viteFastify(),
    viteReact()
  ]
}
