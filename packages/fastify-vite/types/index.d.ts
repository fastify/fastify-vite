// Definitions by: Jens <https://github.com/jens-ox>
/// <reference types="node" />

import type { FastifyPluginAsync, FastifyInstance } from 'fastify'
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
type RouteKey = 'server'
  | 'req'
  | 'reply'
  | 'head'
  | 'state'
  | 'data'
  | 'firstRender'
  | 'layout'
  | 'getMeta'
  | 'getData'
  | 'onEnter'
  | 'streaming'
  | 'clientOnly'
  | 'serverOnly'
type RouteType = Partial<Record<RouteKey, any>>
type RendererOption<ClientModuleType = string | object, ClientType = any> = {
  clientModule: ClientModuleType
  createErrorHandler(client: ClientType, scope: FastifyInstance, config?: any): (error: Error, req?: any, reply?: any) => void
  /** SPA */
  // createHtmlFunction(source: string, scope: FastifyInstance, config?: any): () => any
  /** !SPA */
  createHtmlFunction(source: string, scope: FastifyInstance, config?: any): (ctx: { routes: Array<RouteType>, context: any, body: any } & Record<string, any>) => Promise<any>
  createHtmlTemplateFunction(source: string): (arg0: Record<string, any>) => string
  /** SPA */
  // createRenderFunction(): void
  /** !SPA */
  createRenderFunction({ routes, create }: { routes: Array<RouteType>, create: (arg0: Record<string, any>) => any } & Record<string, any>): Promise<(req: any, ...arg: any[]) => { routes: Array<any>; context: any; body: any; } & Record<string, any>>
  createRoute({ client, handler, errorHandler, route }: { client?: ClientType, handler: (...arg0: any[]) => any, errorHandler: (error: Error, req?: any, reply?: any) => void, route: RouteType } & Record<string, any>, scope: FastifyInstance, config: any): void
  createRouteHandler(client: ClientType, scope?: FastifyInstance, config?: any): (req: any, reply: any) => Promise<any>
  prepareClient(clientModule: ClientModuleType, scope?: FastifyInstance, config?: any): Promise<ClientType>
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
      manifest?: object | Array<any>,
      indexHtml?: Promise<string | Buffer>,
      dir?: string
    },
  }

  export const fastifyVite: FastifyVitePlugin

  export { fastifyVite as default }
}

declare function fastifyVite(...params: Parameters<FastifyVitePlugin>): ReturnType<FastifyVitePlugin>;

export = fastifyVite;
