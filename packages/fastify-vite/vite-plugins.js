import { ensure, remove, resolve, write } from "./ioutils"

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
 * Writes the vite.config properties used by @fastify/vite to a JSON file so production builds can
 * be loaded without importing vite nor the actual vite.config file. This allows vite to remain a
 * devDependency and not need to exist on production Docker images.
 *
 * @param {object} options
 * @param {string} options.outDir - Directory to write the JSON file to
 * @returns 
 */
function writeViteConfigToDist({ outDir }) {
  return {
    name: 'fastify-vite-write-vite-config-to-dist',
    configResolved(config) {
      const jsonFilePath = resolve(outDir, 'vite.config.dist.json')

      if (config.isProduction) {
        ensure(outDir)
        write(jsonFilePath, JSON.stringify({
					base: config.base,
					root: config.root,
					build: {
						assetsDir: config.build.assetsDir,
						outDir: config.build.outDir,
					},
				}), 'utf-8')
			} else {
        remove(jsonFilePath) // dev mode needs the real vite
      }
    }
  }
}

module.exports = { ensureESMBuild, writeViteConfigToDist }
