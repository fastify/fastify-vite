import { createFromReadableStream } from '@vitejs/plugin-rsc/ssr'
import { renderToReadableStream } from 'react-dom/server'
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
  // In dev mode, prefer the source template which references $app/mount.js
  // (resolved by Vite's virtual module system). In production, prefer the
  // built template with hashed bundled scripts.
  // Avoid loading production build artifacts in dev mode — the Vite dev
  // server cannot serve the hashed bundled assets at those paths.
  const isDev = import.meta.env.DEV
  const candidates = isDev
    ? [
        join(process.cwd(), 'client', 'index.html'),
        'client/index.html',
        join(process.cwd(), 'client', 'dist', 'client', 'index.html'),
        join(process.cwd(), 'index.html'),
        'index.html',
      ]
    : [
        join(process.cwd(), 'client', 'dist', 'client', 'index.html'),
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
  // Read the RSC flight data for client-side hydration scripts.
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

  // Use routeRSCServerRequest from react-router to handle RSC stream reading,
  // redirect detection, and response wrapping. Previously we reimplemented
  // this directly, but that bypassed react-router's Router context management
  // and used react-dom/server.edge — a separate module from the non-RSC
  // renderer's react-dom/server (node). Both modules share the same React
  // LocationContext object but manage _currentValue independently, causing
  // "Router inside another Router" errors after non-RSC page renders.
  // Using react-dom/server (not .edge) ensures both renders share the same
  // module instance with consistent context lifecycle.
  const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent('index')

  return await routeRSCServerRequest({
    request,
    serverResponse,
    createFromReadableStream,
    hydrate: false,
    async renderHTML(getPayload, options) {
      const payload = await getPayload()
      const formState = payload.formState

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

      // Inject head metadata into the template start before streaming begins.
      // templateBefore contains <head> tags, so transformHtmlTemplate can
      // inject title/meta/link tags there. Individual SSR chunks don't contain
      // <head>, so they'd pass through transformHtmlTemplate unchanged anyway.
      const headInjectedBefore = await transformHtmlTemplate(head, templateBefore)

      // Stream the RSC SSR content progressively — emit templateBefore first,
      // then each cleaned HTML chunk, then RSC payload scripts and templateAfter.
      return htmlStream.pipeThrough(
        new TransformStream({
          start(controller) {
            controller.enqueue(encoder.encode(headInjectedBefore))
          },
          transform(chunk, controller) {
            const str = typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true })
            // Strip the _R_ bootstrap script — mount.js handles RSC hydration.
            // React SSR doesn't split <script> tags across chunk boundaries,
            // so a simple .replace() on each chunk is sufficient.
            const cleaned = str.replace(/<script id="_R_">.*?<\/script>/g, '')
            controller.enqueue(encoder.encode(cleaned))
          },
          async flush(controller) {
            // Embed RSC flight data and the rest of the HTML shell.
            // No controller.terminate() — returning from flush() lets the
            // TransformStream close both sides normally.
            controller.enqueue(encoder.encode(rscPayloadScripts + (templateAfter ?? '')))
          },
        }),
      )
    },
  })
}
