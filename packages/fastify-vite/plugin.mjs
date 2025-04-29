import getDeepMergeFunction from '@fastify/deepmerge'
import { isAbsolute, join, write, sep } from './ioutils.cjs'

export function viteFastify({ spa, clientModule } = {}) {
  let jsonFilePath
  let configToWrite = {}
  let resolvedConfig = {}

  return {
    name: 'vite-fastify',
    enforce: 'pre',
    async config(config, { mode }) {
      const dev = mode === 'development'
      const outDir = config.build?.outDir ?? 'dist'
      const deepMerge = getDeepMergeFunction()
      const {
        resolveClientModule,
        createSSREnvironment,
        createClientEnvironment,
      } = await import('./config.js')

      if (!config.environments) {
        config.environments = {}
      }
      config.environments.client = deepMerge(
        createClientEnvironment(dev, outDir),
        config.environments.client ?? {},
      )
      if (!spa) {
        const ssrEntryPoint = clientModule ?? resolveClientModule(config.root)
        config.environments.ssr = deepMerge(
          createSSREnvironment(dev, outDir, ssrEntryPoint),
          config.environments.ssr ?? {},
        )
        if (!config.builder) {
          config.builder = {}
        }
        // Write the JSON file after the bundle finishes writing to avoid getting deleted by emptyOutDir
        if (!config.builder.buildApp) {
          config.builder.buildApp = async (builder) => {
            await builder.build(builder.environments.client)
            await builder.build(builder.environments.ssr)
          }
        }
      }
    },
    async configResolved(config = {}) {
      const { base, build, isProduction, root } = config
      const { assetsDir } = build || {}

      resolvedConfig = config

      resolvedConfig.fastify = { clientModule }

      // During vite dev builds, this function can be called multiple times. Sometimes, the resolved
      // configs in these executions are missing many properties. Since there is no advantage to
      // running this function during dev, we save build time and prevent errors by returning early.
      if (!isProduction) {
        return
      }

      // For SSR builds, `vite build` is executed twice: once for client and once for server.
      // We need to merge the two configs and make both `outDir` properties available.
      const fastify = {
        outDirs: {},
      }
      fastify.entryPaths = Object.fromEntries(
        Object.entries(resolvedConfig.environments)
          .map(([env, envConfig]) => {
            if (envConfig.build.outDir) {
              fastify.outDirs[env] = envConfig.build.outDir
            }
            if (envConfig.build?.rollupOptions?.input?.index) {
              return [env, envConfig.build?.rollupOptions?.input?.index]
            }
            return false
          })
          .filter(Boolean),
      )

      configToWrite = {
        base,
        root,
        build: {
          assetsDir,
          outDir: fastify.outDirs.client ?? 'dist/client',
        },
        fastify,
      }

      const outDirs = Object.values(fastify.outDirs)
      const commonDistFolder = outDirs.length > 1 
        ? findCommonPath(outDirs)
        // Handle SPA case where there's only dist/client
        : outDirs[0].split(sep)[0]
      if (isAbsolute(commonDistFolder)) {
        jsonFilePath = join(commonDistFolder, 'vite.config.json')
      } else {
        jsonFilePath = join(root, commonDistFolder, 'vite.config.json')
      }
    },
    async writeBundle() {
      await write(
        jsonFilePath,
        JSON.stringify(configToWrite, undefined, 2),
        'utf-8',
      )
    },
  }
}

export function findCommonPath(paths) {
  if (paths.length === 1) {
    return paths[0]
  }
  const segments = paths.map((path) => path.split('/'))
  const minLength = Math.min(...segments.map((arr) => arr.length))
  const commonSegments = []
  for (let i = 0; i < minLength; i++) {
    const segment = segments[0][i]
    if (segments.every((arr) => arr[i] === segment)) {
      commonSegments.push(segment)
    } else {
      break
    }
  }

  return commonSegments.join('/')
}

export default viteFastify
