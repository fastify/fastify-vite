// Vue 3's non-streaming server-side rendering function
import { renderToString } from '@vue/server-renderer'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import { uneval } from 'devalue'

// The @fastify/vite renderer overrides
export default { createRenderFunction }

function createRenderFunction ({ createApp }) {
  return async function (server, req, reply) {
    // Server data that we want to be used for SSR
    // and made available on the client for hydration
    const data = {
      todoList: [
        'Do laundry',
        'Respond to emails',
        'Write report'
      ]
    }
    // Creates Vue application instance with all the SSR context it needs
    const app = await createApp({ data, server, req, reply }, req.raw.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = await renderToString(app.instance, app.ctx)
    // Return variables to index.html template function
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`
    }
  }
}
