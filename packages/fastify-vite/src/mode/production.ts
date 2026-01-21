import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, parse, resolve } from 'node:path'
import type { FastifyInstance } from 'fastify'
import FastifyStatic from '@fastify/static'
import type { ClientEntries, ClientModule } from '../types/client.ts'
import type { ProdRuntimeConfig } from '../types/options.ts'
import type { ExtendedResolvedViteConfig, SerializableViteConfig } from '../types/vite-configs.ts'
import { resolveIfRelative } from '../ioutils.ts'

type EntryBundle =
  | {
      default?: unknown
    }
  | Record<string, unknown>

interface SetupContext {
  scope: FastifyInstance
}

function fileUrl(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  let pathName = resolve(str).replace(/\\/g, '/')

  if (pathName[0] !== '/') {
    pathName = `/${pathName}`
  }

  return encodeURI(`file://${pathName}`)
}

export async function setup(this: SetupContext, config: ProdRuntimeConfig) {
  const { spa, vite } = config
  let clientOutDir: string
  let ssrOutDir: string
  let assetsDir: string

  if (vite.fastify?.outDirs) {
    const { outDirs } = vite.fastify

    const { packageDirectory } = await import('package-directory')
    const outDirRoot = await packageDirectory({ cwd: config.root })

    clientOutDir = resolveIfRelative(outDirs.client!, outDirRoot)
    ssrOutDir = resolveIfRelative(outDirs.ssr || '', outDirRoot)
    assetsDir = (vite as ExtendedResolvedViteConfig).build.assetsDir
  } else {
    const viteBaseConfig = vite as SerializableViteConfig
    const outDir = resolveIfRelative(viteBaseConfig.build!.outDir!, viteBaseConfig.root!)

    clientOutDir = resolve(outDir, 'client')
    ssrOutDir = resolve(outDir, 'server')
    assetsDir = viteBaseConfig.build!.assetsDir!
  }

  if (!existsSync(clientOutDir)) {
    throw new Error(`No client distribution bundle found at ${clientOutDir}.`)
  }

  if (!spa && !existsSync(ssrOutDir)) {
    throw new Error(`No SSR distribution bundle found at ${ssrOutDir}.`)
  }

  const registrationPrefix = config.prefix || ''
  const basePathname = URL.canParse(vite.base ?? '')
    ? new URL(vite.base!).pathname
    : vite.base || '/'
  await this.scope.register(async function assetFiles(scope: FastifyInstance) {
    const root = [resolve(clientOutDir, assetsDir)]
    if (existsSync(resolve(ssrOutDir, assetsDir))) {
      root.push(resolve(ssrOutDir, assetsDir))
    }
    await scope.register(FastifyStatic, {
      root,
      prefix: join(registrationPrefix, basePathname, assetsDir).replace(/\\/g, '/'),
    })
  })

  await this.scope.register(async function publicFiles(scope: FastifyInstance) {
    await scope.register(FastifyStatic, {
      root: clientOutDir,
      prefix: join(registrationPrefix, basePathname).replace(/\\/g, '/'),
      index: false,
      wildcard: false,
      allowedPath(path: string) {
        return path !== '/index.html'
      },
    })
  })

  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  const { entries, ssrManifest } = await loadEntries()

  Object.defineProperty(config, 'ssrManifest', {
    writable: false,
    value: ssrManifest,
  })

  const client: ClientModule | undefined = !config.spa
    ? await config.prepareClient(entries, this.scope, config)
    : undefined

  this.scope.decorateReply(
    'html',
    await config.createHtmlFunction(config.bundle.indexHtml!, this.scope, config),
  )

  if (config.hasRenderFunction && client) {
    const renderFunction = await config.createRenderFunction(client, this.scope, config)
    this.scope.decorateReply('render', renderFunction)
  }

  return { client, routes: client?.routes }

  async function loadBundle(distOutDir: string, entryPath: string): Promise<EntryBundle> {
    const parsedNamed = parse(entryPath).name
    const bundleFiles = [`${parsedNamed}.js`, `${parsedNamed}.mjs`]

    const fixWin32Path =
      process.platform === 'win32'
        ? (filePath: string) => new URL(fileUrl(filePath))
        : (filePath: string) => filePath

    let getBundlePath: (serverFile: string) => string | URL
    if (isAbsolute(distOutDir)) {
      getBundlePath = (serverFile: string) => fixWin32Path(resolve(distOutDir, serverFile))
    } else {
      const { packageDirectory } = await import('package-directory')
      const pkgDir = await packageDirectory({ cwd: config.root })
      getBundlePath = (serverFile: string) => fixWin32Path(resolve(pkgDir, distOutDir, serverFile))
    }

    let bundlePath: string | URL

    for (const serverFile of bundleFiles) {
      bundlePath = getBundlePath(serverFile)
      if (existsSync(bundlePath)) {
        break
      }
    }
    let bundle = await import(bundlePath as string)
    if (typeof bundle.default === 'function') {
      bundle = await bundle.default(config)
    }
    return bundle.default || bundle
  }

  async function loadEntries() {
    if (config.spa) {
      return {}
    }
    let ssrManifestPath: string
    const manifestPaths = [
      resolve(clientOutDir, 'ssr-manifest.json'),
      resolve(clientOutDir, '.vite/ssr-manifest.json'),
      resolve(clientOutDir, '.vite/manifest.json'),
    ]
    for (const manifestPath of manifestPaths) {
      if (existsSync(manifestPath)) {
        ssrManifestPath = manifestPath
        break
      }
    }
    const ssrManifestPathOrUrl =
      process.platform === 'win32' ? new URL(fileUrl(ssrManifestPath!)) : ssrManifestPath!

    const entries: ClientEntries = {}
    if (vite.fastify?.entryPaths) {
      for (const [env, entryPath] of Object.entries(vite.fastify.entryPaths)) {
        const bundle = await loadBundle(vite.fastify.outDirs![env]!, entryPath)
        if (bundle) {
          entries[env] = bundle as unknown as ClientModule
        }
      }
    }
    return {
      entries,
      ssrManifest: JSON.parse(await readFile(ssrManifestPathOrUrl as string, 'utf8')),
    }
  }
}
