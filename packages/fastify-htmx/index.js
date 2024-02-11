import { readFile } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { findStaticImports } from 'mlly'
import * as devalue from 'devalue'

const root = dirname(new URL(import.meta.url).pathname)

export default {
  createRenderFunction,
  prepareClient,
  createRoute,
  findClientImports,
}

// TODO remove requirement of having this defined 
// in SSR mode as there's need for a render() method if the
// rendering is inlined via createRoute() or createRouteHandler()
function createRenderFunction () {
}

// TODO update @fastify/vite to cover the signature
// of all configuration hooks
async function prepareClient (clientModule, scope, config) {
  if (!clientModule) {
    return null
  }
  const { routes } = clientModule
  for (const route of routes) {
  	route.clientImports = await findClientImports(route.modulePath)
  }
  return Object.assign({}, clientModule, { routes })
}


// The return value of this function gets registered as reply.html()
export function createHtmlFunction (source, scope, config) {
  // Templating functions for universal rendering (SSR+CSR)
  const [unHeadSource, unFooterSource] = source.split('<!-- element -->')
  const unHeadTemplate = createHtmlTemplateFunction(unHeadSource)
  const unFooterTemplate = createHtmlTemplateFunction(unFooterSource)
  // Templating functions for server-only rendering (SSR only)
  const [soHeadSource, soFooterSource] = source
    // Unsafe if dealing with user-input, but safe here
    // where we control the index.html source
    .replace(/<script[^>]+type="module"[^>]+>.*?<\/script>/g, '')
    .split('<!-- element -->')
  const soHeadTemplate = createHtmlTemplateFunction(soHeadSource)
  const soFooterTemplate = createHtmlTemplateFunction(soFooterSource)
  // This function gets registered as reply.html()
  return function ({ routes, context, body }) {
    // Decide which templating functions to use, with and without hydration
    const headTemplate = context.serverOnly ? soHeadTemplate : unHeadTemplate
    const footerTemplate = context.serverOnly ? soFooterTemplate : unFooterTemplate
    // Render page-level <head> elements
    const head = new Head(context.head).render()
    // Create readable stream with prepended and appended chunks
    const readable = Readable.from(generateHtmlStream({
      body: body && (
        context.streaming
          ? onShellReady(body)
          : onAllReady(body)
      ),
      head: headTemplate({ ...context, head }),
      footer: () => footerTemplate({
        ...context,
        hydration: '',
        // Decide whether or not to include the hydration script
        ...!context.serverOnly && {
          hydration: (
            '<script>\n' +
            `window.route = ${devalue.uneval(context.toJSON())}\n` +
            `window.routes = ${devalue.uneval(routes.toJSON())}\n` +
            '</script>'
          ),
        },
      }),
    }))
    // Send out header and readable stream with full response
    this.type('text/html')
    this.send(readable)
  }
}

export function createRoute ({ handler, errorHandler, route }, scope, config) {
  scope.route({
    url: route.path,
    method: route.method ?? 'GET',
    async handler (req, reply) {
      reply.type('text/html')
      if (route.fragment) {
        return await route.default(req, reply)
      } else {
        return reply.html({
          element: await route.default(req, reply),
          hydration: (
            '<script>\n' +
            `window[Symbol.for('hydration')] = {` +
            `  clientImports: ${devalue.uneval(route.clientImports)}\n` +
            `}\n` +
            '</script>'
          )
        })
      }
    },
    errorHandler,
    ...route
  })
}

async function findClientImports (path, imports = []) {
  const source = await readFile(join(root, path), 'utf8')
  const specifiers = findStaticImports(source)
    .filter(({ specifier }) => {
      return specifier.endsWith('.css') || specifier.endsWith('.client.js')
    })
    .map(({ specifier }) => specifier)
  for (const specifier of specifiers) {
    const resolved = resolve(dirname(path), specifier)
    imports.push(resolved)
    if (specifier.endsWith('.client.js')) {
      imports.push(...await findClientImports(resolved))
    }
  }
  return imports
}