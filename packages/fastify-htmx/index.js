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