import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr'
import { renderToReadableStream } from 'react-dom/server.edge'
import {
  unstable_routeRSCServerRequest as routeRSCServerRequest,
  unstable_RSCStaticRouter as RSCStaticRouter,
} from 'react-router'
import { createHead, transformHtmlTemplate } from '@unhead/react/server'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Load the index.html template for the HTML document shell.
 * Tries the Vite client root first, falls back to a hardcoded template.
 */
function loadHtmlTemplate(): string {
  const candidates = [
    join(process.cwd(), 'client', 'index.html'),
    'client/index.html',
    join(process.cwd(), 'index.html'),
    'index.html',
  ]
  for (const path of candidates) {
    try {
      if (existsSync(path)) {
        return readFileSync(path, 'utf-8')
      }
    } catch {
      // continue to next candidate
    }
  }
  return '<!doctype html>\n<html lang="en">\n  <head>\n    <title></title>\n  </head>\n  <body>\n    <div id="root"><!-- element --></div>\n    <script type="module" src="$app/mount.js"></script>\n  </body>\n</html>'
}

/**
 * Escape HTML script content to prevent </script> and <!-- from breaking the page.
 */
function escapeScript(script: string): string {
  return script.replace(/<!--/g, '<\\!--').replace(/<\/(script)/gi, '</\\$1')
}

/**
 * Read the RSC flight data from serverResponse.body and produce
 * __FLIGHT_DATA injection scripts for client-side hydration.
 */
async function readRSCPayload(rscBody: ReadableStream<Uint8Array>): Promise<string> {
  const reader = rscBody.getReader()
  const rscDecoder = new TextDecoder('utf-8', { fatal: true })
  let scripts = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    try {
      const str = rscDecoder.decode(value, { stream: true })
      scripts += `<script>${escapeScript(`(self.__FLIGHT_DATA||=[]).push(${JSON.stringify(str)})`)}</script>\n`
    } catch {
      const b64 = btoa(String.fromCodePoint(...value))
      const encoded = `Uint8Array.from(atob(${JSON.stringify(b64)}), m => m.codePointAt(0))`
      scripts += `<script>${escapeScript(`(self.__FLIGHT_DATA||=[]).push(${encoded})`)}</script>\n`
    }
  }
  const remaining = rscDecoder.decode()
  if (remaining.length) {
    scripts += `<script>${escapeScript(`(self.__FLIGHT_DATA||=[]).push(${JSON.stringify(remaining)})`)}</script>\n`
  }

  return scripts
}

export async function generateHTML(request: Request, serverResponse: Response) {
  // Read the RSC flight data BEFORE passing to routeRSCServerRequest,
  // because routeRSCServerRequest internally consumes serverResponse.body
  // via getPayload() / createStream() for route matching.
  const rscPayloadScripts = await readRSCPayload(serverResponse.clone().body!)

  const indexHtml = loadHtmlTemplate()
  const el = '<!-- element -->'
  const [templateBefore, templateAfter] = indexHtml.split(el)

  return await routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    hydrate: false,
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
      let html = ''

      return htmlStream.pipeThrough(
        new TransformStream({
          transform(chunk, _controller) {
            const str = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true })
            html += str
          },
          async flush(controller) {
            // Strip the _R_ bootstrap script — mount.js handles RSC hydration
            html = html.replace(/<script id="_R_">.*?<\/script>/g, '')

            const bodyContent = templateBefore + html + (templateAfter ?? '')

            const headInjected = await transformHtmlTemplate(head, bodyContent)

            const finalHtml = headInjected.replace('</body>', rscPayloadScripts + '</body>')

            controller.enqueue(encoder.encode(finalHtml))
          },
        }),
      )
    },
  })
}
