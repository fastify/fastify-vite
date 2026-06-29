import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr'
import { renderToReadableStream } from 'react-dom/server.edge'
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from 'react-router'
import { createHead, transformHtmlTemplate } from '@unhead/react/server'

export async function generateHTML(request, serverResponse) {
  return await routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    async renderHTML(getPayload, options) {
      const payload = await getPayload()
      const formState = payload.formState
      const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent('index')
      const head = createHead()
      if (payload.head) {
        head.push(payload.head)
      }
      const htmlStream = await renderToReadableStream(<RSCStaticRouter getPayload={getPayload} />, {
        ...options,
        bootstrapScriptContent,
        formState,
        signal: request.signal,
      })
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()
      let buffer = ''
      let headInjected = false
      const headInjectTransform = new TransformStream({
        async transform(chunk, controller) {
          if (headInjected) {
            controller.enqueue(chunk)
            return
          }
          buffer += decoder.decode(chunk, { stream: true })
          const headCloseIdx = buffer.indexOf('</head>')
          if (headCloseIdx !== -1) {
            headInjected = true
            const headSection = buffer.slice(0, headCloseIdx + '</head>'.length)
            const bodyContent = buffer.slice(headCloseIdx + '</head>'.length)
            const transformed = await transformHtmlTemplate(head, headSection)
            controller.enqueue(encoder.encode(transformed + bodyContent))
            buffer = null
          }
        },
        flush(controller) {
          if (headInjected) return
          if (buffer) {
            transformHtmlTemplate(head, buffer).then((transformed) => {
              controller.enqueue(encoder.encode(transformed))
            })
          }
        },
      })
      return htmlStream.pipeThrough(headInjectTransform)
    },
  })
}
