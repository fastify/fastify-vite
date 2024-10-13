import { join } from 'node:path'
import { viteFastify } from '@fastify/vite/plugin'
import viteReact from '@vitejs/plugin-react'

export default {
  root: join(import.meta.dirname, 'src/client'),
  plugins: [
    viteReact(), 
    viteFastify()
  ],
  build: {
    emptyOutDir: true,
    outDir: join(import.meta.dirname, 'dist/client'),
  },
};
