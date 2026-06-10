// `createRoutes` is consumed by the generated `$app/index.{js,ts}` virtual
// module (see `virtual/index.js` and `virtual-ts/index.ts`) and exposed via
// the `@fastify/vue/server` subpath export, not from the main entry point.

import type {
  FastifyInstance,
  onErrorHookHandler,
  onRequestAbortHookHandler,
  onRequestHookHandler,
  onResponseHookHandler,
  onSendHookHandler,
  onTimeoutHookHandler,
  preHandlerHookHandler,
  preParsingHookHandler,
  preSerializationHookHandler,
  preValidationHookHandler,
} from 'fastify'
import type { UseHeadInput } from '@unhead/vue'
import type { Component } from 'vue'
import type RouteContext from './context.ts'

interface RouteExports {
  component?: Component
  layout?: string
  path?: string
  getData?: (ctx: RouteContext) => Promise<Record<string, unknown>> | Record<string, unknown>
  getMeta?: (ctx: RouteContext) => Promise<UseHeadInput> | UseHeadInput
  onEnter?: (
    ctx: RouteContext,
  ) => Promise<Record<string, unknown> | void> | Record<string, unknown> | void
  streaming?: boolean
  clientOnly?: boolean
  serverOnly?: boolean
  configure?: (scope: FastifyInstance) => Promise<void> | void
  onRequest?: onRequestHookHandler | onRequestHookHandler[]
  preParsing?: preParsingHookHandler | preParsingHookHandler[]
  preValidation?: preValidationHookHandler | preValidationHookHandler[]
  preHandler?: preHandlerHookHandler | preHandlerHookHandler[]
  preSerialization?: preSerializationHookHandler | preSerializationHookHandler[]
  onError?: onErrorHookHandler | onErrorHookHandler[]
  onSend?: onSendHookHandler | onSendHookHandler[]
  onResponse?: onResponseHookHandler | onResponseHookHandler[]
  onTimeout?: onTimeoutHookHandler | onTimeoutHookHandler[]
  onRequestAbort?: onRequestAbortHookHandler | onRequestAbortHookHandler[]
  [key: string]: unknown
}

interface RouteEntry extends RouteExports {
  id: string
  name: string
  path: string
  key: string
}

type RouteModuleInput = (() => Promise<RouteExports>) | RouteExports

class Routes extends Array<RouteEntry> {
  toJSON(): unknown[] {
    return this.map((route) => {
      return {
        id: route.id,
        path: route.path,
        key: route.key,
        name: route.name,
        layout: route.layout,
        getData: !!route.getData,
        getMeta: !!route.getMeta,
        onEnter: !!route.onEnter,
      }
    })
  }
}

export async function createRoutes(
  fromPromise: Promise<{ default: Record<string, RouteModuleInput> | RouteEntry[] }>,
  { param }: { param: RegExp } = { param: /\[([.\w]+\+?)\]/ },
): Promise<Routes> {
  const { default: from } = await fromPromise
  const importPaths = Object.keys(from)
  const promises: Array<Promise<RouteEntry>> = []
  if (Array.isArray(from)) {
    for (const routeDef of from) {
      promises.push(
        getRouteModule(routeDef.path, routeDef.component as RouteModuleInput).then((routeModule) => {
          return {
            id: routeDef.path,
            name: routeDef.path ?? routeModule.path,
            path: routeDef.path ?? routeModule.path,
            key: routeDef.path ?? routeModule.path,
            ...routeModule,
          } as RouteEntry
        }),
      )
    }
  } else {
    const fromRecord = from as Record<string, RouteModuleInput>
    // Ensure that static routes have precedence over the dynamic ones
    for (const path of importPaths.sort((a, b) => (a > b ? -1 : 1))) {
      promises.push(
        getRouteModule(path, fromRecord[path]).then((routeModule) => {
          const route: RouteEntry = {
            id: path,
            layout: routeModule.layout,
            name: path
              // Remove /pages and .vue extension
              .slice(6, -4)
              // Remove params
              .replace(param, () => '')
              // Remove leading and trailing slashes
              .replace(/^\/*|\/*$/g, '')
              // Replace slashes with underscores
              .replace(/\//g, '_'),
            path:
              routeModule.path ??
              path
                // Remove /pages and .vue extension
                .slice(6, -4)
                // Replace [id] with :id and [slug+] with :slug+
                .replace(param, (_m, m) => `:${m}`)
                // Replace '/index' with '/'
                .replace(/\/index$/, '/')
                // Remove trailing slashes
                .replace(/(.+)\/+$/, (..._m) => _m[1]),
            ...routeModule,
          } as RouteEntry

          route.key = route.path

          if (route.name === '') {
            route.name = 'catch-all'
          }

          return route
        }),
      )
    }
  }
  return new Routes(...(await Promise.all(promises)))
}

interface RawRouteModule extends RouteExports {
  default?: Component
}

function getRouteModuleExports(routeModule: RawRouteModule): RouteExports {
  return {
    // The Route component (default export)
    component: routeModule.default,
    // The Layout Route component
    layout: routeModule.layout,
    // Route-level hooks
    getData: routeModule.getData,
    getMeta: routeModule.getMeta,
    onEnter: routeModule.onEnter,
    // Other Route-level settings
    streaming: routeModule.streaming,
    clientOnly: routeModule.clientOnly,
    serverOnly: routeModule.serverOnly,
    // Server configure function
    configure: routeModule.configure,
    // // Route-level Fastify hooks
    onRequest: routeModule.onRequest,
    preParsing: routeModule.preParsing,
    preValidation: routeModule.preValidation,
    preHandler: routeModule.preHandler,
    preSerialization: routeModule.preSerialization,
    onError: routeModule.onError,
    onSend: routeModule.onSend,
    onResponse: routeModule.onResponse,
    onTimeout: routeModule.onTimeout,
    onRequestAbort: routeModule.onRequestAbort,
  }
}

async function getRouteModule(
  _path: string,
  routeModuleInput: RouteModuleInput,
): Promise<RouteExports> {
  if (typeof routeModuleInput === 'function') {
    const routeModule = (await routeModuleInput()) as RawRouteModule
    return getRouteModuleExports(routeModule)
  }
  return getRouteModuleExports(routeModuleInput as RawRouteModule)
}
