
import viteFastify from '@fastify/vite/plugin'

if (!globalThis.port) {
  globalThis.port = 7981
}

export default () => ({
  root: import.meta.dirname,
  plugins: [
    viteFastify()
  ],
  server: {
    hmr: {
      port: globalThis.port++,
    },
  },
})
