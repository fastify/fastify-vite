import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import type { RouteDefinition } from './route.ts'

export interface ReplyDotRenderContext {
  app?: FastifyInstance
  server?: FastifyInstance
  req?: FastifyRequest
  reply?: FastifyReply
  client?: unknown
  route?: RouteDefinition
  [key: string]: unknown
}

export type ReplyDotRenderResult = Record<string, unknown>

export type ReplyDotRenderFunction = (
  this: FastifyReply,
  ctx?: ReplyDotRenderContext,
) => ReplyDotRenderResult | Promise<ReplyDotRenderResult>

export type ReplyDotHtmlFunction = (
  this: FastifyReply,
  ctx?: ReplyDotRenderResult,
) => FastifyReply | Promise<FastifyReply>
