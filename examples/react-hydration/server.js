import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import renderer from './renderer.js'

const server = Fastify()
const root = import.meta.url

await server.register(FastifyVite, { root, renderer })

await server.vite.ready()
await server.listen(3000)
