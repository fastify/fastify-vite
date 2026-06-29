import {
  renderToReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  loadServerAction,
  decodeAction,
  decodeFormState,
} from '@vitejs/plugin-rsc/rsc'
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from 'react-router'
import routesManifest from '$app/routes.js'
import { filePathToRoutePath } from '#runtime/route-utils.js'
/**
 * URL suffix to differentiate RSC requests from SSR requests.
 * RSC requests end with '_.rsc', which is stripped to get the actual URL path.
 */
const URL_POSTFIX = '_.rsc'

/**
 * Header name for passing the server action ID in RSC action requests.
 */
const HEADER_ACTION_ID = 'x-rsc-action'

/**
 * Parse an incoming HTTP request to determine if it's an RSC request,
 * a server action, or a regular document (SSR) request.
 *
 * - Requests ending with `_.rsc` are RSC payload requests
 * - POST requests with `x-rsc-action` header are server action calls
 * - Everything else is a regular document request delegated to SSR
 */
function parseRenderRequest(request) {
  const url = new URL(request.url)
  const isAction = request.method === 'POST'
  if (url.pathname.endsWith(URL_POSTFIX)) {
    url.pathname = url.pathname.slice(0, -URL_POSTFIX.length)
    const actionId = request.headers.get(HEADER_ACTION_ID) || undefined
    return {
      isRsc: true,
      isAction,
      actionId,
      url,
    }
  }
  return { isRsc: false, isAction, url }
}

/**
 * Build an array of RSCRouteConfigEntry objects from the `$app/routes.js`
 * manifest (the `import.meta.glob` result over the pages directory).
 *
 * Routes are sorted in descending order so that static routes take
 * precedence over dynamic ones during matching.
 *
 * @returns {Array<RouteConfigEntry>} RSC route config entries
 */
function buildRouteConfig() {
  const importPaths = Object.keys(routesManifest)
  return importPaths
    .sort((a, b) => (a > b ? -1 : 1))
    .map((importPath) => ({
      id: importPath,
      path: filePathToRoutePath(importPath) || '/',
      lazy: routesManifest[importPath],
    }))
}

/**
 * Extract head metadata (title, meta tags, link tags) from the matched
 * route's page module. The route module can optionally export a `getMeta()`
 * function that returns head metadata.
 *
 * @param {string} routeId - The file path of the matched route
 * @param {URL} url - The normalized request URL
 * @returns {Promise<{title?: string, meta?: Array<{name: string, content: string}>, link?: Array<{rel: string, href: string}>} | null>}
 */
async function extractHeadMeta(routeId, url) {
  const loader = routesManifest[routeId]
  if (!loader) return null

  try {
    const routeModule = await loader()
    if (typeof routeModule?.getMeta === 'function') {
      return await routeModule.getMeta({ url })
    }
  } catch {
    // getMeta is optional — silently ignore failures
  }
  return null
}

/**
 * RSC request handler.
 *
 * Processes incoming HTTP requests, handling three cases:
 * 1. **Server actions** (POST): Decode and execute server functions,
 *    returning updated RSC payload reflecting state changes.
 * 2. **RSC requests** (URL with `_.rsc` suffix): Return an RSC payload
 *    stream containing the server-rendered component tree and head metadata.
 * 3. **Document requests** (no suffix): Delegate to the SSR environment
 *    to produce full HTML with RSC payload embedded for hydration.
 *
 * @param {Request} request - The incoming HTTP request
 * @returns {Promise<Response>} The RSC stream or HTML response
 */
async function handler(request) {
  const renderRequest = parseRenderRequest(request)

  // ------------------------------------------------------------------
  // 1. Handle server actions
  // ------------------------------------------------------------------
  let returnValue
  let formState
  let temporaryReferences
  let actionStatus
  if (renderRequest.isAction) {
    if (renderRequest.actionId) {
      // Server action called via React Server Callback
      // (e.g., onClick with useActionState or direct server function call)
      const contentType = request.headers.get('content-type')
      const body = contentType?.startsWith('multipart/form-data')
        ? await request.formData()
        : await request.text()
      temporaryReferences = createTemporaryReferenceSet()
      const args = await decodeReply(body, { temporaryReferences })
      const action = await loadServerAction(renderRequest.actionId)
      try {
        const data = await action.apply(null, args)
        returnValue = { ok: true, data }
      } catch (e) {
        returnValue = { ok: false, data: e }
        actionStatus = 500
      }
    } else {
      // Progressive enhancement: server action via <form action={...}>
      // Used when JavaScript is disabled or before hydration.
      const formData = await request.formData()
      const decodedAction = await decodeAction(formData)
      try {
        const result = await decodedAction()
        formState = await decodeFormState(result, formData)
      } catch {
        return new Response('Internal Server Error', { status: 500 })
      }
    }
  }

  // After action handling, replace request with a GET request so React
  // Router skips mutation processing entirely. The action result is already
  // stored in returnValue — React Router just needs to render the route,
  // not process the action itself. If we pass a POST request with a consumed
  // body (already read by request.formData()), React Router's processServerAction
  // tries request.clone().formData() on an ended stream, producing empty FormData.
  if (renderRequest.isAction) {
    const rscUrl = new URL(request.url)
    request = new Request(rscUrl, {
      method: 'GET',
      headers: request.headers,
    })
  }

  // ------------------------------------------------------------------
  // 2-4. Match, generate RSC response, and produce HTML for document requests
  // ------------------------------------------------------------------
  let rscResponse
  try {
    const routes = buildRouteConfig()

    rscResponse = await matchRSCServerRequest({
      createTemporaryReferenceSet,
      decodeAction,
      decodeFormState,
      decodeReply,
      loadServerAction,
      request,
      routes,
      async generateResponse(match) {
        // Extract head metadata from the matched leaf route
        const leafMatch = match.payload?.matches?.[match.payload.matches.length - 1]
        let head = null

        // Primary approach: use leafMatch route id from react-router match
        if (leafMatch?.route?.id) {
          head = await extractHeadMeta(leafMatch.route.id, renderRequest.url)
        }

        // P3: Fallback — match by URL pathname against routesManifest directly.
        // This handles cases where the match payload's route.id format doesn't
        // align with the import.meta.glob keys in routesManifest.
        if (!head) {
          const routePath = renderRequest.url.pathname
          for (const [importPath, loader] of Object.entries(routesManifest)) {
            if (filePathToRoutePath(importPath) === routePath) {
              head = await extractHeadMeta(importPath, renderRequest.url)
              break
            }
          }
        }

        // Spread the full match payload (includes type, matches, loaderData, location)
        const rscPayload = { ...match.payload, head, formState, returnValue }

        const rscOptions = temporaryReferences ? { temporaryReferences } : undefined
        return new Response(renderToReadableStream(rscPayload, rscOptions), {
          status: actionStatus ?? match.statusCode,
          headers: match.headers,
        })
      },
    })

    // Return RSC stream for .rsc requests directly
    if (renderRequest.isRsc) {
      return rscResponse
    }

    // Delegate to SSR environment for full document (HTML) requests
    const ssrEntry = await import.meta.viteRsc.import('./ssr-entry.jsx', { environment: 'ssr' })
    const htmlResult = await ssrEntry.generateHTML(request, rscResponse.clone())

    // Buffer the RSC HTML stream and send as a string response body.
    // This avoids streaming compatibility issues with Fastify's sendWebStream()
    // when the stream produces content asynchronously via TransformStream.flush().
    const bodyChunks = []
    const htmlReader = htmlResult.body.getReader()
    let readResult
    while (!(readResult = await htmlReader.read()).done) {
      bodyChunks.push(readResult.value)
    }
    const bodyText = bodyChunks.map((c) => new TextDecoder().decode(c, { stream: true })).join('')

    return new Response(bodyText, {
      status: htmlResult.status,
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    // Render error using Youch (project convention for dev error pages)
    const { Youch } = await import('youch')
    const youch = new Youch()
    const html = await youch.toHTML(error, { title: 'RSC Render Error' })
    return new Response(html, {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    })
  }
}

export default { fetch: handler }

if (import.meta.hot) {
  import.meta.hot.accept()
}
