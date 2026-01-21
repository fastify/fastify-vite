import type { FastifyReply, FastifyRequest } from 'fastify'

import type { DecoratedReply } from './reply.ts'
import type { ClientRouteArgs } from './route.ts'

export type RouteHandler = (
  req: FastifyRequest,
  reply: DecoratedReply,
) => DecoratedReply | Promise<DecoratedReply>

export type ErrorHandler = (error: Error, req: FastifyRequest, reply: FastifyReply) => void

/** Full args for createRoute including handler and error handler */
export interface CreateRouteArgs extends ClientRouteArgs {
  handler?: RouteHandler
  errorHandler: ErrorHandler
}
