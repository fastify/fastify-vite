import { setTimeout } from 'timers/promises'
import { dirname } from 'path'
import Fastify from 'fastify'
import FastifyVite from 'fastify-vite'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import devalue from 'devalue'

const server = Fastify()

// Some server data to serve as example
server.decorate('todoList', [
  'Do laundry',
  'Respond to emails',
  'Write report',
])

// An API endpoint to add items to server.todoList
// It'll serve to illustrate posting client data to the server
server.post('/add', (req, reply) => {
  server.todoList.push(req.body.item)
  reply.send(0)
})

// An API endpoint to return the route state for /
// It'll be called directly by the Index.jsx component
// during client-side navigation
server.get('/state', async (_, reply) => {
  // Simulate a little delay to see the loader message on the client
  await setTimeout(1500)
  reply.send({
    data: {
      todoList: server.todoList
    },
    // If todoList came from a remote source and there the
    // a possibility a loading error, you could relay
    // the error to the client route state here
    error: undefined
  })
})

await server.register(FastifyVite, {
  dev: process.argv.includes('--dev'),
  configRoot: dirname(new URL(import.meta.url).pathname),
  serverEntryPoint: '/entry/server.jsx',
  clientEntryPoint: '/entry/client.jsx',
  createRenderFunction (createRouter) {
    return async function render (server, req, reply, url, options) {
      const data = { todoList: server.todoList }
      const element = renderToString(
        createRouter({ data, server, req, reply }, url)
      )
      return { 
        // If todoList came from a remote source and there the
        // a possibility a loading error, you could relay
        // the error to the client route state here
        routeState: devalue({ data, error: null }), 
        element
      }
    }
  },
})

server.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.code(500)
  reply.send('Check logs!')
})

await server.vite.ready()
await server.listen(3000)
