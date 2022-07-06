import { svelte as viteSvelte } from '@sveltejs/vite-plugin-svelte'
import viteFastify from 'fastify-vite/plugin'

// @type {import('vite').UserConfig}
export default {
  root: './client',
  plugins: [
    viteSvelte(),
    viteFastify(),
  ],
}
