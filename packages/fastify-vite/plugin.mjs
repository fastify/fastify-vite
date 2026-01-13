import { dirname, isAbsolute, join, relative, sep } from 'node:path'
import getDeepMergeFunction from '@fastify/deepmerge'
import { writeFile } from 'node:fs/promises'

export function viteFastify({ spa, clientModule } = {}) {
  let customOutDir
  let jsonFilePath
  let configToWrite = {}
  let resolvedConfig = {}

  return {
    name: 'vite-fastify',
    enforce: 'pre',
    async config(rawConfig, { mode }) {
      customOutDir = rawConfig.build?.outDir
      const isDevMode = mode === 'development'
      const outDir = customOutDir ?? 'dist'
      const deepMerge = getDeepMergeFunction()
      const { resolveClientModule, createSSREnvironment, createClientEnvironment } =
        await import('./config.js')

      if (!rawConfig.environments) {
        rawConfig.environments = {}
      }
      rawConfig.environments.client = deepMerge(
        createClientEnvironment(isDevMode, outDir),
        rawConfig.environments.client ?? {},
      )
      if (!spa) {
        const ssrEntryPoint = clientModule ?? resolveClientModule(rawConfig.root)
        rawConfig.environments.ssr = deepMerge(
          createSSREnvironment(isDevMode, outDir, ssrEntryPoint),
          rawConfig.environments.ssr ?? {},
        )
        if (!rawConfig.builder) {
          rawConfig.builder = {}
        }
        // Write the JSON file after the bundle finishes writing to avoid getting deleted by emptyOutDir
        if (!rawConfig.builder.buildApp) {
          rawConfig.builder.buildApp = async (builder) => {
            await builder.build(builder.environments.client)
            await builder.build(builder.environments.ssr)
          }
        }
      }
    },
    async configResolved(config = {}) {
      const { base, build, isProduction, root: resolvedViteRoot } = config
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
            if (envConfig.build?.outDir) {
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
        root: resolvedViteRoot,
        build: {
          assetsDir,
          outDir: fastify.outDirs.client ?? 'dist/client',
        },
        fastify,
      }

      const applicationRootDirectory = await makeAllPathsRelative(configToWrite)

      const outDirs = Object.values(fastify.outDirs)
      const commonDistFolder =
        outDirs.length > 1
          ? findCommonPath(outDirs)
          : // Handle SPA case where there's only client outDir - get parent folder
            dirname(outDirs[0])

      if (isAbsolute(commonDistFolder)) {
        jsonFilePath = join(commonDistFolder, 'vite.config.json')
      } else {
        jsonFilePath = join(applicationRootDirectory, commonDistFolder, 'vite.config.json')
      }
    },
    async writeBundle() {
      await writeFile(jsonFilePath, JSON.stringify(configToWrite, undefined, 2), 'utf-8')
    },
  }
}

export function findCommonPath(paths) {
  if (paths.length === 1) {
    return paths[0]
  }
  const segments = paths.map((path) => path.split(sep))
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

  return commonSegments.join(sep)
}

async function makeAllPathsRelative(resolvedViteConfigToWrite) {
  const { packageDirectory } = await import('package-directory')
  const { build, fastify, root: absoluteViteRoot } = resolvedViteConfigToWrite
  const applicationRootDirectory = await packageDirectory({ cwd: absoluteViteRoot })

  resolvedViteConfigToWrite.root = relative(applicationRootDirectory, absoluteViteRoot)

  if (build?.outDir) {
    const absoluteOutDir = isAbsolute(build.outDir)
      ? build.outDir
      : join(absoluteViteRoot, build.outDir)
    build.outDir = relative(applicationRootDirectory, absoluteOutDir)
  }

  Object.keys(fastify.outDirs).forEach((key) => {
    const outDir = fastify.outDirs[key]
    const absoluteOutDir = isAbsolute(outDir) ? outDir : join(absoluteViteRoot, outDir)
    fastify.outDirs[key] = relative(applicationRootDirectory, absoluteOutDir)
  })

  return applicationRootDirectory
}

export default viteFastify
