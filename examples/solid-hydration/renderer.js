import { renderToStringAsync, generateHydrationScript } from 'solid-js/web'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import { uneval } from 'devalue'

// The @fastify/vite renderer overrides
export function createRenderFunction ({ createApp }) {
  // createApp is exported by client/index.js
  return async function ({ app: server, req, reply }) {
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
    const app = createApp({ data, server, req, reply })
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const element = await renderToStringAsync(app)
    return {
      // Server-side rendered HTML fragment
      element,
      // The SSR context data is also passed to the template, inlined for hydration
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`,
      // Required by Solid
      hydrationScript: generateHydrationScript()
    }
  }
}
