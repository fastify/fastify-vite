import { readFile } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { findStaticImports } from 'mlly'
import { renderToStream } from '@kitajs/html/suspense'
import * as devalue from 'devalue'

const root = dirname(new URL(import.meta.url).pathname)

export default {
  createRenderFunction,
  prepareClient,
  createRoute,
  findClientImports,
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
  const asReadable = createHtmlTemplateFunction(source)
  return function ({ element, hydration }) {
    // Send out header and readable stream with full response
    this.type('text/html')
    this.send(asReadable({ element, hydration }))
  }
}

export function createRouteHandler ({ client, route }, scope, config) {
  if (route.fragment) {
    return async function (req, reply) {
      reply.type('text/html')
      return await route.default({ app: scope, req, reply })
    }
  } else {
    return async function (req, reply) {
      return reply.html({
        element: renderToStream(
          route.default({ app: scope, req, reply })
        ),
        hydration: (
          '<script>\n' +
          `window[Symbol.for('hydration')] = {` +
          `  clientImports: ${devalue.uneval(route.clientImports)}\n` +
          `}\n` +
          '</script>'
        )
      })
    }
  }
}

export function createRoute ({ handler, errorHandler, route }, scope, config) {
  scope.route({
    url: route.path,
    method: route.method ?? 'GET',
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