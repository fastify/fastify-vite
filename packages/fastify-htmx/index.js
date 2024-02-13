import { readFile } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { findStaticImports } from 'mlly'
import { renderToStream } from '@kitajs/html/suspense.js'
import * as devalue from 'devalue'

export default {
  prepareClient,
  createHtmlFunction,
  createRouteHandler,
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
  	route.clientImports = await findClientImports(config.vite.root, route.modulePath)
  }
  return Object.assign({}, clientModule, { routes })
}

// The return value of this function gets registered as reply.html()
export function createHtmlFunction (source, scope, config) {
  const htmlTemplate = config.createHtmlTemplateFunction(source)
  return function ({ element, hydration }) {
    const html = htmlTemplate({ element, hydration })
    // Send out header and readable stream with full response
    this.type('text/html')
    this.send(html)
    return this
  }
}

export function createRouteHandler ({ client, route }, scope, config) {
  if (route.fragment) {
    return async function (req, reply) {
      req.route = route
      reply.type('text/html')
      reply.send(await route.default({ app: scope, req, reply }))
    }
  } else {
    return async function (req, reply) {
      req.route = route
      reply.html({
        // https://github.com/kitajs/html?tab=readme-ov-file#suspense-component
        element: await client.root({ 
          app: scope, 
          req, 
          reply,
          children: await route.default({ app: scope, req, reply }),
        }),
        hydration: (
          '<script>\n' +
          `window[Symbol.for('hydration')] = {` +
          `  clientImports: ${devalue.uneval(route.clientImports)}\n` +
          `}\n` +
          '</script>'
        )
      })
      return reply
    }
  }
}

async function findClientImports (root, path, imports = []) {
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
      imports.push(...await findClientImports(root, resolved))
    }
  }
  return imports
}