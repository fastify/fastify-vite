const { ensure, remove, resolve, write } = require("./ioutils")

function ensureESMBuild() {
  return {
    name: 'fastify-vite-ensure-esm-build',
    config(config, { command }) {
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

/**
 * Writes the vite.config properties used by fastify-vite to a JSON file so production builds can
 * be loaded without importing vite nor the actual vite.config file. This allows vite to remain a
 * devDependency and not need to exist on production Docker images.
 *
 * @param {object} options
 * @param {string} options.distDir - The directory to create the JSON file into. Must match the
 *   `viteConfigDistDir` provided to FastifyVite when registering the plugin onto a Fastify server.
 * @returns 
 */
function saveViteConfigToDist({ distDir }) {
  return {
    name: 'fastify-vite-write-vite-to-dist',
    configResolved(config) {
      const jsonFilePath = resolve(distDir, 'vite.config.dist.json')

      if (config.isProduction) {
        ensure(distDir)
        return write(jsonFilePath, JSON.stringify({
					base: config.base,
					root: config.root,
					build: {
						assetsDir: config.build.assetsDir,
						outDir: config.build.outDir,
					},
				}, undefined, 2), 'utf-8')
			} else {
        return remove(jsonFilePath) // dev mode needs the real vite
      }
    }
  }
}

module.exports.ensureESMBuild = ensureESMBuild
module.exports.saveViteConfigToDist = saveViteConfigToDist
