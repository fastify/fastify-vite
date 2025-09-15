// Vue 3's non-streaming server-side rendering function
import { renderToString } from '@vue/server-renderer'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import { uneval } from 'devalue'

// The @fastify/vite renderer overrides
export default {
  createRenderFunction,
  createRoute,
  prepareServer
}

export function prepareServer (server) {
  server.log.info('prepareServer() hook picked up from configuration!')
}

async function createRoute ({ handler, errorHandler, route }, scope, config) {
  if (route.configure) {
    await route.configure(scope)
  }
  if (route.getServerSideProps) {
    // If getServerSideProps is provided, register JSON endpoint for it
    scope.get(`/json${route.path}`, async (req, reply) => {
      return reply.send(await route.getServerSideProps({
        req,
        ky: scope.ky
      }))
    })
  }
  scope.get(route.path, {
    // If getServerSideProps is provided,
    // make sure it runs before the SSR route handler
    ...route.getServerSideProps && {
      async preHandler (req, reply) {
        req.serverSideProps = await route.getServerSideProps({
          req,
          ky: scope.ky
        })
      }
    },
    handler,
    errorHandler,
    ...route
  })
}

function createRenderFunction ({ createApp }) {
  return async function ({ app: server, req, reply }) {
    // Server data that we want to be used for SSR
    // and made available on the client for hydration
    const serverSideProps = req.serverSideProps
    // Creates Vue application instance with all the SSR context it needs
    const app = await createApp({ serverSideProps, server, req, reply }, req.raw.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = await renderToString(app.instance, app.ctx)
    // Return variables to index.html template function
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ serverSideProps })}</script>`
    }
  }
}
