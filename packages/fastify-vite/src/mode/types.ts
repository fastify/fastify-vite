import type { FastifyInstance } from 'fastify'
import type { ViteDevServer } from 'vite'
import type { ModuleRunner } from 'vite/module-runner'
import type { ClientEntries } from '../types/client.ts'

/** Shared setup context interface used by both dev and production setup functions */
export interface SetupFunctionContext {
  scope: FastifyInstance
  devServer?: ViteDevServer
  entries?: ClientEntries
  runners?: Record<string, ModuleRunner>
}
