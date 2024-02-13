import { readFile } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { findStaticImports } from 'mlly'
import { renderToStream } from '@kitajs/html/suspense.js'
import * as devalue from 'devalue'

export default {
  prepareClient,
  createHtmlFunction,
  createRouteHandler,
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
  return function (ctx) {
    this.type('text/html')
    this.send(htmlTemplate(ctx))
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
        head: await renderHead(client, route, { app: scope, req, reply }),
        element: renderToStream((rid) => client.root({ 
          app: scope, 
          req, 
          reply,
          rid,
          children: route.default({ app: scope, req, reply, rid }),
        })),
        hydration: (
          '<script>\n' +
          `window[Symbol.for('clientImports')] = ${
            devalue.uneval(route.clientImports)
          }\n` +
          '</script>'
        )
      })
      return reply
    }
  }
}

async function renderHead (client, route, ctx) {
  let rendered = ''
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