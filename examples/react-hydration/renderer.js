// React 18's non-streaming server-side rendering function
import { renderToString } from 'react-dom/server'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import { uneval } from 'devalue'

// The @fastify/vite renderer overrides
export default { createRenderFunction }

function createRenderFunction ({ createApp }) {
  // createApp is exported by client/index.js
  return async function (ccc) {
    const { app, req, reply } = ccc
    // Server data that we want to be used for SSR
    // and made available on the client for hydration
    const data = {
      todoList: [
        'Do laundry',
        'Respond to emails',
        'Write report'
      ]
    }
    // Creates main React component with all the SSR context it needs
    const main = createApp({ data, server: app, req, reply }, req.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = await renderToString(main)
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`
    }
  }
}
