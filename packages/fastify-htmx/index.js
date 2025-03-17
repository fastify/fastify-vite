import { readFile } from 'node:fs/promises'
import { dirname, extname, join, resolve } from 'node:path'
import { renderToStream } from '@kitajs/html/suspense.js'
import * as devalue from 'devalue'
import { findStaticImports, resolvePath } from 'mlly'

export default {
  prepareClient,
  createHtmlFunction,
  createRouteHandler,
  createErrorHandler,
}

const kPrefetch = Symbol('kPrefetch')
/**
 * An in-memory cache for resolved imports.
 * @type Map<string, { js: string[], css: string[], svg:[] }
 */
const clientImportsCache = new Map()

async function prepareClient(clientModule, scope, config) {
  if (!clientModule) {
    return null
  }
  clientImportsCache.clear()

  let defaultLayout = null
  try {
    defaultLayout = await resolveLayoutFilePath(config.vite.root, 'default')
  } catch (e) {
    scope.log.info(
      'No default layout specified. Falling back to virtual layout.',
    )
  }

  const { routes } = clientModule
  for (const route of routes) {
    // Predecorate Request and Reply objects
    if (route.decorateRequest) {
      for (const prop of route.decorateRequest) {
        !scope.hasRequestDecorator(prop) && scope.decorateRequest(prop, null)
      }
    }
    if (route.decorateReply) {
      for (const prop of route.decorateReply) {
        !scope.hasReplyDecorator(prop) && scope.decorateReply(prop, null)
      }
    }
    // prefetch layout file path
    let layoutFilePath = null
    if (route.layout) {
      layoutFilePath = await resolveLayoutFilePath(
        config.vite.root,
        route.layout,
      )
    } else if (defaultLayout) {
      layoutFilePath = defaultLayout
    }

    // Pregenerate prefetching <head> elements
    let assets = { css: [], svg: [], js: [] }
    if (layoutFilePath) {
      assets = await findClientImports(config, layoutFilePath)
    }
    // Extract the route's imports
    const { css, svg, js } = await findClientImports(
      config,
      route.modulePath,
      assets,
    )
    route[kPrefetch] = ''
    for (const stylesheet of css) {
      if (config.dev) {
        route[kPrefetch] += `  <link rel="stylesheet" href="/${stylesheet}">\n`
      } else if (config.ssrManifest[stylesheet]) {
        const [asset] = config.ssrManifest[stylesheet].filter((s) =>
          s.endsWith('.css'),
        )
        route[kPrefetch] +=
          `  <link rel="stylesheet" href="${asset}" crossorigin>\n`
      }
    }
    for (const image of svg) {
      if (config.dev) {
        route[kPrefetch] +=
          `  <link as="image" rel="preload" href="/${image}" fetchpriority="high">\n`
      } else if (config.ssrManifest[image]) {
        const [asset] = config.ssrManifest[image].filter((s) =>
          s.endsWith('.svg'),
        )
        route[kPrefetch] +=
          `  <link as="image" rel="preload" href="${asset}" fetchpriority="high">\n`
      }
    }
    for (const script of js) {
      if (config.dev) {
        route[kPrefetch] += `<script src="/${script}" type="module"></script>\n`
      } else if (config.ssrManifest[script]) {
        const [asset] = config.ssrManifest[script].filter((s) =>
          s.endsWith('.js'),
        )
        route[kPrefetch] +=
          `<script src="${asset}" type="module" crossorigin></script>\n`
      }
    }
  }
  return Object.assign({}, clientModule, { routes })
}

// The return value of this function gets registered as reply.html()
export function createHtmlFunction(source, scope, config) {
  const htmlTemplate = config.createHtmlTemplateFunction(source)
  return function (ctx) {
    this.type('text/html')
    this.send(htmlTemplate(ctx))
    return this
  }
}

export function createRouteHandler({ client, route }, scope, config) {
  if (route.fragment) {
    return async (req, reply) => {
      req.route = route
      reply.type('text/html')
      return reply.send(
        await route.default({ app: scope, req, reply, client, route }),
      )
    }
  }
  return async (req, reply) => {
    req.route = route
    reply.html({
      head: await renderHead(client, route, {
        app: scope,
        req,
        reply,
        client,
        route,
      }),
      element: renderToStream((rid) =>
        client.root({
          app: scope,
          req,
          reply,
          rid,
          children: route.default({
            app: scope,
            client,
            route,
            req,
            reply,
            rid,
          }),
        }),
      ),
    })
    return reply
  }
}

async function renderHead(client, route, ctx) {
  let rendered = ''
  if (route[kPrefetch]) {
    rendered += route[kPrefetch]
  }
  if (route.head === 'function') {
    rendered += await route.head(ctx)
  } else if (route.head) {
    rendered += route.head
  }
  rendered += '\n'
  if (client.head === 'function') {
    rendered += await client.head(ctx)
  } else if (client.head) {
    rendered += client.head
  }
  return rendered
}

async function findClientImports(
  config,
  path,
  { js = [], css = [], svg = [] } = {},
) {
  const {
    dev,
    vite: { root },
  } = config
  // Don't re-evaluate the file's dependencies if we've processed it before
  if (!dev && clientImportsCache.has(path)) {
    const cached = clientImportsCache.get(path)
    return { js: [...cached.js], css: [...cached.css], svg: [...cached.svg] }
  }
  const source = await readFile(join(root, path), 'utf8')

  const specifiers = (
    await Promise.all(
      findStaticImports(source).map(async ({ specifier }) => {
        if (extname(specifier)) {
          return specifier
        }
        const resolved = resolve(dirname(path), specifier)

        // resolve the file extension which allows for
        // resolved client imports without specified extensions
        try {
          const filePathWithExtension = await resolvePath(
            join(root, resolved),
            {
              extensions: ['.mjs', '.cjs', '.js', '.jsx', '.ts', '.tsx'],
            },
          )
          const specifier = filePathWithExtension.replace(root, '')

          return specifier
        } catch (e) {
          return ''
        }
      }),
    )
  ).filter((specifier) => {
    return specifier.match(/\.((svg)|(css)|(m?js)|(tsx?)|(jsx?))$/)
  })

  for (const specifier of specifiers) {
    if (specifier.match(/\.server\./)) {
      continue
    }
    const resolved = resolve(dirname(path), specifier)
    if (specifier.match(/\.svg$/)) {
      svg.push(resolved.slice(1))
    }
    if (specifier.match(/\.css$/)) {
      css.push(resolved.slice(1))
    }
    if (specifier.match(/\.((m?js)|(tsx?)|(jsx?))$/)) {
      if (specifier.match(/\.client\.((m?js)|(tsx?)|(jsx?))$/)) {
        js.push(resolved.slice(1))
      }
      const submoduleImports = await findClientImports(config, resolved)
      // always add JS submodules to the cache
      clientImportsCache.set(resolved, submoduleImports)
      js.push(...submoduleImports.js)
      css.push(...submoduleImports.css)
      svg.push(...submoduleImports.svg)
    }
  }
  // Always cache layouts, they're checked often
  if (path.includes('layouts')) {
    clientImportsCache.set(path, { js: [...js], css: [...css], svg: [...svg] })
  }
  return { js, css, svg }
}

/**
 * @type Map<string,string>
 */
const layoutFilePathCache = new Map()
/**
 * Calculates the relative path and extension of the given layout name
 * @param {string} root The root directory to search for the layout in
 * @param {string} layout The layout file name (without extension)
 * @returns {Promise<string>}
 */
async function resolveLayoutFilePath(root, layout) {
  if (layoutFilePathCache.has(layout)) {
    return Promise.resolve(layoutFilePathCache.get(layout))
  }
  const fullPath = await resolvePath(join(root, 'layouts', layout), {
    extensions: ['.mjs', '.cjs', '.js', '.jsx', '.ts', '.tsx'],
  })
  const relativePath = fullPath.replace(root, '')
  layoutFilePathCache.set(layout, relativePath)
  return relativePath
}

function createErrorHandler(_, scope, config) {
  return (error, req, reply) => {
    if (config.dev) {
      scope.log.error(error)
      scope.vite.devServer.ssrFixStacktrace(error)
    }
    scope.errorHandler(error, req, reply)
  }
}
