const { isAbsolute, dirname, resolve } = require('node:path');
const { ensure, remove, write } = require("./ioutils")

/**
 * Writes the vite.config properties used by fastify-vite to a JSON file so production builds can
 * be loaded without importing vite nor the actual vite.config file. This allows vite to remain a
 * devDependency and not need to exist on production Docker images.
 *
 * @param {object} [options]
 * @param {string} [options.distDir='dist/server'] - The directory to create the JSON file into. 
 *   Must match the `viteConfigDistDir` provided to FastifyVite when registering the plugin onto a 
 *   Fastify server. If a non-absolute path is provided, it will be resolved relative to the
 *   location of your `vite.config.js` file.
 * @returns 
 */
function viteFastify({ distDir = 'dist/server' } = {}) {
  return {
    name: 'vite-fastify',
    async configResolved(config) {
      if (!isAbsolute(distDir)) {
        distDir = resolve(dirname(config.configFile), distDir)
      }

      const jsonFilePath = resolve(distDir, 'vite.config.dist.json')

      if (config.isProduction) {
        await ensure(distDir)
        await write(jsonFilePath, JSON.stringify({
          base: config.base,
          root: config.root,
          build: {
            assetsDir: config.build.assetsDir,
            outDir: config.build.outDir,
          },
        }, undefined, 2), 'utf-8')
      } else {
        await remove(jsonFilePath) // dev mode needs the real vite
      }
    }
  }
}

module.exports.viteFastify = viteFastify
