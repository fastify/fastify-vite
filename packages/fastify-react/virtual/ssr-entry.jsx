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
function loadHtmlTemplate() {
  // Try reading from the Vite client root relative to CWD
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
  // Fallback template — identical to the Vite client served index.html
  return '<!doctype html>\n<html lang="en">\n  <head>\n    <title></title>\n  </head>\n  <body>\n    <div id="root"><!-- element --></div>\n    <script type="module" src="$app/mount.js"></script>\n  </body>\n</html>'
}

/**
 * Escape HTML script content to prevent </script> and <!-- from breaking the page.
 * Matches the escaping used by rsc-html-stream/server.
 */
function escapeScript(script) {
  return script.replace(/<!--/g, '<\\!--').replace(/<\/(script)/gi, '</\\$1')
}

/**
 * Read the RSC flight data from serverResponse.body and produce
 * __FLIGHT_DATA injection scripts for client-side hydration.
 * Matches the encoding used by rsc-html-stream/server's injectRSCPayload.
 */
async function readRSCPayload(rscBody) {
  const reader = rscBody.getReader()
  const rscDecoder = new TextDecoder('utf-8', { fatal: true })
  let scripts = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    try {
      // Try to decode as UTF-8 text
      const str = rscDecoder.decode(value, { stream: true })
      scripts += `<script>${escapeScript(`(self.__FLIGHT_DATA||=[]).push(${JSON.stringify(str)})`)}</script>\n`
    } catch {
      // Binary data — encode as base64 with Uint8Array reconstruction
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

export async function generateHTML(request, serverResponse) {
  // Read the RSC flight data BEFORE passing to routeRSCServerRequest,
  // because routeRSCServerRequest internally consumes serverResponse.body
  // via getPayload() / createStream() for route matching.
  let rscPayloadScripts = ''
  try {
    const clone = serverResponse.clone()
    rscPayloadScripts = await readRSCPayload(clone.body)
  } catch (err) {
    console.error('[ssr-entry] Failed to read RSC payload', err)
  }

  const el = '<!-- element -->'
  const indexHtml = loadHtmlTemplate()
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

      // Create unhead instance and push head metadata from getMeta
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

      // Buffer the RSC SSR content, then wrap in the index.html template,
      // inject head metadata, and embed the RSC flight data for hydration.
      return htmlStream.pipeThrough(
        new TransformStream({
          transform(chunk, _controller) {
            const str = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true })
            html += str
          },
          async flush(controller) {
            // Strip the _R_ bootstrap script — mount.js handles RSC hydration
            html = html.replace(/<script id="_R_">.*?<\/script>/g, '')

            // Build the full HTML document using the template
            const bodyContent = templateBefore + html + (templateAfter ?? '')

            // Inject head metadata (title, meta, etc.) via unhead
            const headInjected = await transformHtmlTemplate(head, bodyContent)

            // Embed RSC flight data before </body> for client hydration
            const finalHtml = headInjected.replace('</body>', rscPayloadScripts + '</body>')

            controller.enqueue(encoder.encode(finalHtml))
          },
        }),
      )
    },
  })
}
