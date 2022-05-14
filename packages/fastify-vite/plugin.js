function vitePlugin () {
  return {
    name: 'fastify-vite',
    config (config, { command }) {
      if (command === 'build' && config.build?.ssr) {
        config.build.rollupOptions = {
          output: {
            format: 'es',
          },
        }
      }
    },
  }
}

module.exports = vitePlugin
