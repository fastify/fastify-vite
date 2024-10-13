// Helpers from the Node.js stream library
// used to prepend and append chunks the body stream
import { Readable } from 'node:stream'

// Vue 3's streaming server-side rendering function for Node.js
import { renderToNodeStream } from 'vue/server-renderer'

// @fastify/vite's minimal HTML templating function,
// which extracts interpolation variables from comments
// and returns a function with the generated code
import { createHtmlTemplateFunction } from '@fastify/vite/utils'

// Used to safely serialize JavaScript into
// <script> tags, preventing a few types of attack
import { uneval } from 'devalue'

// The @fastify/vite renderer overrides
export default {
  createHtmlFunction,
  createRenderFunction
}

// The return value of this function gets registered as reply.html()
async function createHtmlFunction (source, scope, config) {
  const [headSource, footer] = source.split('<!-- element -->')
  const headTemplate = await createHtmlTemplateFunction(headSource)
  return function ({ stream, data }) {
    const head = headTemplate({
      hydration: `<script>window.hydration = ${uneval({ data })}</script>`
    })
    this.type('text/html')
    const readable = Readable
      .from(streamHtml(head, stream, footer))
      // Errors from Vue SSR can be captured here
      .on('error', console.log)
    this.send(readable)
  }
}

function createRenderFunction ({ createApp }) {
  // createApp is exported by client/index.js
  return async function ({ app: server, req, reply }) {
    const data = {
      todoList: [
        'Do laundry',
        'Respond to emails',
        'Write report'
      ]
    }
    // Creates Vue app instance with all the SSR context it needs
    const app = await createApp({ data, server, req, reply }, req.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    const stream = renderToNodeStream(app.instance, app.ctx)
    // The SSR context data is passed along so it can be inlined for hydration
    return { data, stream }
  }
}

// Helper function to prepend and append chunks the body stream
async function * streamHtml (head, body, footer) {
  yield head
  // renderToNodeStream() returns an AsyncIterator so we can just await on it
  for await (const chunk of body) {
    yield chunk
  }
  yield footer
}
