import { defineConfig } from 'rolldown'

export default defineConfig({
  input: './index.js',
  output: {
    format: 'esm',
    file: 'index.dist.js',
  },
})
