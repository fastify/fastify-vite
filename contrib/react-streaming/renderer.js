// Helpers from the Node.js stream library to
// make it easier to work with renderToPipeableStream()
import { Readable, PassThrough } from 'node:stream'

// React 18's preferred server-side rendering function,
// which enables the combination of React.lazy() and Suspense
import { renderToPipeableStream } from 'react-dom/server'

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
      // Errors from React SSR can be captured here
      .on('error', console.log)
    this.send(readable)
    return this
  }
}

function createRenderFunction ({ createApp }) {
  // createApp is exported by client/index.js
  return function ({ server, req, reply }) {
    const data = {
      todoList: [
        'Do laundry',
        'Respond to emails',
        'Write report'
      ]
    }
    // Creates main React component with all the SSR context it needs
    const app = createApp({ data, server, req, reply }, req.url)
    // Perform SSR, i.e., turn app.instance into an HTML fragment
    // The SSR context data is passed along so it can be inlined for hydration
    return { data, stream: toReadable(app) }
  }
}

// Helper function to prepend and append chunks the body stream
async function * streamHtml (head, body, footer) {
  for await (const chunk of await head) {
    yield chunk
  }
  // We first await on the stream being ready (onShellReady)
  // And then await on its AsyncIterator
  for await (const chunk of await body) {
    yield chunk
  }
  for await (const chunk of await footer) {
    yield chunk
  }
}

// Helper function to get an AsyncIterable (via PassThrough)
// from the limited stream returned by renderToPipeableStream()
function toReadable (app) {
  const duplex = new PassThrough()
  return new Promise((resolve, reject) => {
    try {
      const pipeable = renderToPipeableStream(app, {
        onShellReady () {
          resolve(pipeable.pipe(duplex))
        },
        onShellError (error) {
          reject(error)
        }
      })
    } catch (error) {
      resolve(error)
    }
  })
}
