import viteSolid from 'vite-plugin-solid'
import viteFastify from 'fastify-vite/plugin'

// @type {import('vite').UserConfig}
export default {
  root: './client',
  plugins: [
    viteSolid({ ssr: true }),
    viteFastify(),
  ],
  ssr: {
    noExternal: ['solid-app-router'],
  },
}
