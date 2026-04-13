import { Server as TlsServer } from 'node:tls'
import type { FastifyInstance } from 'fastify'

export function prepareServer(server: FastifyInstance) {
  let url: string
  server.decorate('serverURL', { getter: () => url })
  server.addHook('onListen', () => {
    const { port, address, family } = server.server.address() as {
      port: number
      address: string
      family: string
    }
    const protocol = server.server instanceof TlsServer ? 'https' : 'http'
    if (family === 'IPv6') {
      url = `${protocol}://[${address}]:${port}`
    } else {
      url = `${protocol}://${address}:${port}`
    }
  })
}
