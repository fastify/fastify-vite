import viteFastify from '@fastify/vite/plugin'

export default {
  root: import.meta.dirname,
  plugins: [viteFastify({ spa: true })],
}
