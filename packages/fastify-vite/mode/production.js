const { join, resolve } = require('node:path')
const FastifyStatic = require('@fastify/static')
const { parse, resolveIfRelative, read, exists } = require('../ioutils.cjs')

function fileUrl(str) {
  if (typeof str !== 'string') {
    throw new Error('Expected a string')
  }

  let pathName = resolve(str).replace(/\\/g, '/')

  // Windows drive letter must be prefixed with a slash
  if (pathName[0] !== '/') {
    pathName = `/${pathName}`
  }

  return encodeURI(`file://${pathName}`)
}

async function setup(config) {
  const { spa, vite } = config
  let clientOutDir
  let ssrOutDir

  if (vite.fastify) {
    clientOutDir = resolveIfRelative(vite.fastify.outDirs.client, vite.root)
    ssrOutDir = resolveIfRelative(vite.fastify.outDirs.ssr || '', vite.root)
  } else {
    // Backwards compatibility for projects that do not use the viteFastify plugin.
    const outDir = resolveIfRelative(vite.build.outDir, vite.root)

    clientOutDir = resolve(outDir, 'client')
    ssrOutDir = resolve(outDir, 'server')
  }

  // For production you get the distribution version of the render function
  const { assetsDir } = vite.build

  if (!exists(clientOutDir)) {
    throw new Error('No client distribution bundle found.')
  }

  if (!spa && !exists(ssrOutDir)) {
    throw new Error('No SSR distribution bundle found.')
  }

  // We also register fastify-static to serve all static files
  // in production (dev server takes care of this)
  await this.scope.register(async function assetFiles(scope) {
    const root = [resolve(clientOutDir, assetsDir)]
    if (exists(resolve(ssrOutDir, assetsDir))) {
      root.push(resolve(ssrOutDir, assetsDir))
    }
    await scope.register(FastifyStatic, {
      root,
      prefix: join(
        URL.canParse(vite.base)
          ? new URL(vite.base).pathname
          : vite.base || '/',
        assetsDir,
      ).replace(/\\/g, '/'),
    })
  })

  // And again for files in the public/ folder
  await this.scope.register(async function publicFiles(scope) {
    await scope.register(FastifyStatic, {
      root: clientOutDir,
      wildcard: false,
      allowedPath(path) {
        return path !== '/index.html'
      },
    })
  })

  // Note: this is just to ensure it works, for a real world
  // production deployment, you'll want to capture those paths in
  // Nginx or just serve them from a CDN instead
  Object.defineProperty(config, 'hasRenderFunction', {
    writable: false,
    value: typeof config.createRenderFunction === 'function',
  })

  // Load routes from client module (server entry point)
  const { entries, ssrManifest } = await loadEntries()

  // Make SSR Manifest available in the config
  Object.defineProperty(config, 'ssrManifest', {
    writable: false,
    value: ssrManifest,
  })

  const client = !config.spa && await config.prepareClient(entries, this.scope, config)

  // Set reply.html() function with production version of index.html
  this.scope.decorateReply(
    'html',
    await config.createHtmlFunction(
      config.bundle.indexHtml,
      this.scope,
      config,
    ),
  )

  if (config.hasRenderFunction) {
    // Set reply.render() function with the client module production bundle
    const renderFunction = await config.createRenderFunction(
      client,
      this.scope,
      config,
    )
    this.scope.decorateReply('render', renderFunction)
  }

  return { client, routes: client?.routes }

  async function loadBundle(viteRoot, distOutDir, entryPath) {
    const parsedNamed = parse(entryPath).name
    const bundleFiles = [`${parsedNamed}.js`, `${parsedNamed}.mjs`]
    let bundlePath
    for (const serverFile of bundleFiles) {
      // Use file path on Windows
      bundlePath =
        process.platform === 'win32'
          ? new URL(fileUrl(resolve(viteRoot, distOutDir, serverFile)))
          : resolve(viteRoot, distOutDir, serverFile)
      if (exists(bundlePath)) {
        break
      }
    }
    let bundle = await import(bundlePath)
    if (typeof bundle.default === 'function') {
      bundle = await bundle.default(config)
    }
    return bundle.default || bundle
  }

  // Loads the Vite application server entry point for the client
  async function loadEntries() {
    if (config.spa) {
      return {}
    }
    let ssrManifestPath
    const manifestPaths = [
      // Vite v4 and v5
      resolve(clientOutDir, 'ssr-manifest.json'),
      // Vite v6 Beta
      resolve(clientOutDir, '.vite/ssr-manifest.json'),
      // Vite v6
      resolve(clientOutDir, '.vite/manifest.json'),
    ]
    for (const manifestPath of manifestPaths) {
      if (exists(manifestPath)) {
        ssrManifestPath = manifestPath
      }
    }
    const ssrManifest =
      process.platform === 'win32'
        ? new URL(fileUrl(ssrManifestPath))
        : ssrManifestPath

    const entries = {}
    for (const [env, entryPath] of Object.entries(config.vite.fastify.entryPaths)) {
      entries[env] = await loadBundle(
        config.vite.root,
        config.vite.fastify.outDirs[env],
        entryPath,
      )
    }
    return {
      entries,
      ssrManifest: JSON.parse(await read(ssrManifest, 'utf8')),
    }
  }
}

module.exports = {
  setup,
}
