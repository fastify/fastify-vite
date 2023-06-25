// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import { uneval } from 'devalue'

// The @fastify/vite renderer overrides
export default { createRenderFunction }

function createRenderFunction ({ Base }) {
  // createApp is exported by client/index.js
  return function (server, req, reply) {
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
    const { html: element } = Base.render({
      url: req.url,
      data
    })
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`
    }
  }
}
