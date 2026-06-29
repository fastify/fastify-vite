import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr'
import { renderToReadableStream } from 'react-dom/server.edge'
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from 'react-router'
import { createHead } from '@unhead/react/server'

export async function generateHTML(request, serverResponse) {
  // Head data was embedded in the RSC payload by the rsc entry
  // routeRSCServerRequest handles shell construction
  // unhead head injection happens inside the renderHTML callback

  return await routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    async renderHTML(getPayload, options) {
      const payload = await getPayload()
      const formState = payload.type === 'render' ? await payload.formState : undefined

      const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent('index')

      // Inject head metadata from getMeta into unhead
      // Head data is part of the RSC payload via the head field
      const head = createHead()
      if (payload.head) {
        head.push(payload.head)
      }

      return await renderToReadableStream(<RSCStaticRouter getPayload={getPayload} />, {
        ...options,
        bootstrapScriptContent,
        formState,
        signal: request.signal,
      })
    },
  })
}
