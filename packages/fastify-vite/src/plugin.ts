import { dirname, isAbsolute, join, relative, sep } from 'node:path'
import { writeFile } from 'node:fs/promises'
import getDeepMergeFunction from '@fastify/deepmerge'
import { packageDirectory } from 'package-directory'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'
import type { SerializableViteConfig, ViteFastifyConfig } from './types/vite-configs.ts'

export interface ViteFastifyPluginOptions {
  /**
   * Enable SPA mode (no SSR environment)
   */
  spa?: boolean
  /**
   * Path to the client module entry point
   */
  clientModule?: string
}

/**
 * Vite plugin for Fastify integration.
 * Configures Vite environments for client and SSR builds.
 */
export function viteFastify(options: ViteFastifyPluginOptions = {}): Plugin {
  const { spa, clientModule } = options
  let customOutDir: string | undefined
  let jsonFilePath: string
  let configToWrite: SerializableViteConfig
  let resolvedConfig: ResolvedConfig

  return {
    name: 'vite-fastify',
    enforce: 'pre',
    async config(rawConfig: UserConfig, { mode }): Promise<void> {
      customOutDir = rawConfig.build?.outDir
      const isDevMode = mode === 'development'
      const outDir = customOutDir ?? 'dist'
      const deepMerge = getDeepMergeFunction()
      const { resolveClientModule } = await import('./config/paths.ts')
      const { createSSREnvironment, createClientEnvironment } =
        await import('./config/environments.ts')

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
    async configResolved(config: ResolvedConfig): Promise<void> {
      const { base, build, mode, root: resolvedViteRoot } = config
      const { assetsDir } = build

      resolvedConfig = config

      resolvedConfig.fastify = { clientModule }

      // During vite dev, this function can be called multiple times. Sometimes, the resolved
      // configs in these executions are missing many properties. Since there is no advantage to
      // running this function during dev, we save build time and prevent errors by returning early.
      // Note: We check `mode` instead of `isProduction` because `isProduction` depends on NODE_ENV,
      // which may be set to 'test' by test runners like vitest, even during production builds.
      if (mode !== 'production') {
        return
      }

      const applicationRootDirectory = await packageDirectory({ cwd: resolvedViteRoot })

      // For SSR builds, `vite build` is executed twice: once for client and once for server.
      // We need to merge the two configs and make both `outDir` properties available.
      const fastify: ViteFastifyConfig = {
        outDirs: {},
      }
      fastify.entryPaths = Object.fromEntries(
        Object.entries(resolvedConfig.environments)
          .map(([env, envConfig]) => {
            const envBuild = envConfig.build as
              | { outDir?: string; rollupOptions?: { input?: { index?: string } } }
              | undefined
            if (envBuild?.outDir) {
              fastify.outDirs[env] = envBuild.outDir
            }
            if (envBuild?.rollupOptions?.input?.index) {
              return [env, envBuild.rollupOptions.input.index]
            }
            return false
          })
          .filter(Boolean) as [string, string][],
      )

      configToWrite = makeAllPathsRelative(applicationRootDirectory, {
        base,
        root: resolvedViteRoot,
        build: {
          assetsDir,
          outDir: fastify.outDirs.client ?? 'dist/client',
        },
        fastify,
      })

      const outDirs = Object.values(configToWrite.fastify?.outDirs ?? {})
      const commonDistFolder =
        outDirs.length > 1
          ? findCommonPath(outDirs)
          : outDirs.length === 1
            ? // Handle SPA case where there's only client outDir - get parent folder
              dirname(outDirs[0])
            : dirname(configToWrite.build.outDir)

      if (isAbsolute(commonDistFolder)) {
        jsonFilePath = join(commonDistFolder, 'vite.config.json')
      } else {
        jsonFilePath = join(applicationRootDirectory, commonDistFolder, 'vite.config.json')
      }
    },
    async writeBundle(): Promise<void> {
      await writeFile(jsonFilePath, JSON.stringify(configToWrite, undefined, 2), 'utf-8')
    },
  }
}

/**
 * Finds the common path prefix among an array of paths.
 */
export function findCommonPath(paths: string[]): string {
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

function makeAllPathsRelative(
  applicationRootDirectory: string,
  resolvedViteConfigToWrite: SerializableViteConfig,
): SerializableViteConfig {
  const { build, fastify, root: absoluteViteRoot } = resolvedViteConfigToWrite

  const absoluteBuildOutDir = isAbsolute(build.outDir)
    ? build.outDir
    : join(absoluteViteRoot, build.outDir)
  const relativeBuildOutDir = relative(applicationRootDirectory, absoluteBuildOutDir)

  const relativeOutDirs = fastify?.outDirs
    ? Object.fromEntries(
        Object.entries(fastify.outDirs).map(([key, outDir]) => {
          const absoluteOutDir = isAbsolute(outDir) ? outDir : join(absoluteViteRoot, outDir)
          return [key, relative(applicationRootDirectory, absoluteOutDir)]
        }),
      )
    : undefined

  return {
    ...resolvedViteConfigToWrite,
    root: relative(applicationRootDirectory, absoluteViteRoot),
    build: {
      ...build,
      outDir: relativeBuildOutDir,
    },
    fastify: fastify
      ? {
          ...fastify,
          outDirs: relativeOutDirs,
        }
      : undefined,
  }
}

export default viteFastify
