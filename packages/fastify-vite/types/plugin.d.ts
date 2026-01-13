import type { Plugin } from 'vite'

export interface ViteFastifyPluginOptions {
  /**
   * Enable SPA mode (no SSR environment)
   */
  spa?: boolean
  /**
   * Path to the client module entry point
   */
  clientModule?: string
}

/**
 * Vite plugin for Fastify integration.
 * Configures Vite environments for client and SSR builds.
 */
export declare function viteFastify(options?: ViteFastifyPluginOptions): Plugin

/**
 * Finds the common path prefix among an array of paths.
 */
export declare function findCommonPath(paths: string[]): string

export default viteFastify
