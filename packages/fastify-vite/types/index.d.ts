// Definitions by: Jens <https://github.com/jens-ox>
/// <reference types="node" />

import type { FastifyPluginAsync, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { UserConfig } from 'vite'
declare module 'fastify' {
  interface FastifyReply {
    html(): void
    render(): void
  }

  interface FastifyInstance {
    vite: {
      ready(): Promise<void>
    }
  }
}

type FastifyVitePlugin = FastifyPluginAsync<NonNullable<fastifyVite.FastifyViteOptions>>;

type RouteType = Partial<{
  server: unknown
  req: unknown
  reply: unknown
  head: unknown
  state: unknown
  data: Record<string, unknown>
  firstRender: boolean
  layout: unknown
  getMeta: unknown
  getData: unknown
  onEnter: unknown
  streaming: unknown
  clientOnly: unknown
  serverOnly: unknown
}>
type Loosen<T> = T & Record<string, unknown>
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
type Ctx = Loosen<{ routes: Array<RouteType>, context: unknown, body: unknown, stream: unknown, data: unknown }>

interface RendererFunctions {
  createHtmlTemplateFunction(source: string): unknown
  createHtmlFunction(source: string, scope?: unknown, config?: unknown): (ctx: Ctx) => Promise<unknown>;
  createRenderFunction(args: Loosen<{ routes: Array<RouteType>, create: (arg0: Record<string, unknown>) => unknown, createApp: unknown }>): Promise<(server: unknown, req: unknown, reply: unknown) => Ctx | { element:string, hydration:string }>
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
interface RendererOption<ClientModuleType = string | Record<string, unknown> | unknown, ClientType = unknown> extends RendererFunctions {
  clientModule: ClientModuleType
  createErrorHandler(client: ClientType, scope: FastifyInstance, config?: unknown): (error: Error, req?: FastifyRequest, reply?: FastifyReply) => void
  createRoute(args: Loosen<{ client?: ClientType, handler?: (...args: unknown[]) => unknown, errorHandler: (error: Error, req?: FastifyRequest, reply?: FastifyReply) => void, route?: RouteType }>, scope: FastifyInstance, config: unknown): void
  createRouteHandler(client: ClientType, scope: FastifyInstance, config?: unknown): (req: FastifyRequest, reply: FastifyReply) => Promise<unknown>
  prepareClient(clientModule: ClientModuleType, scope?: FastifyInstance, config?: unknown): Promise<ClientType>
}

declare namespace fastifyVite {

  export interface FastifyViteOptions extends Partial<RendererOption> {
    dev?: boolean
    root: string
    spa?: boolean
    renderer?: string | Partial<RendererOption>
    vite?: UserConfig
    viteConfig?: string
    bundle?: {
      manifest?: object,
      indexHtml?: string | Buffer,
      dir?: string
    },
  }

  export const fastifyVite: FastifyVitePlugin

  export { fastifyVite as default }
}

declare function fastifyVite(...params: Parameters<FastifyVitePlugin>): ReturnType<FastifyVitePlugin>;

export = fastifyVite;
