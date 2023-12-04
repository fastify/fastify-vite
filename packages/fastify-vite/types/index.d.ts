// Definitions by: Jens <https://github.com/jens-ox>
/// <reference types="node" />

import { FastifyPluginAsync } from 'fastify'

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

declare namespace fastifyVite {

  export interface FastifyViteOptions {
    dev: boolean
    root: string
    spa: boolean
  }

  export const fastifyVite: FastifyVitePlugin

  export { fastifyVite as default }
}

declare function fastifyVite(...params: Parameters<FastifyVitePlugin>): ReturnType<FastifyVitePlugin>;

export = fastifyVite;
