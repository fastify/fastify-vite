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
 * Transform a file path from `import.meta.glob` into a route path string.
 *
 * Handles:
 * - `/pages/index` -> `/` (after extension stripping)
 * - `/pages/about` -> `/about`
 * - `/pages/blog/[slug]` -> `/blog/:slug`
 * - `/pages/blog/[...slug]` -> `/blog/*`
 */
function filePathToRoutePath(importPath) {
  return (
    importPath
      // Remove '/pages' prefix and file extension (.jsx or .tsx)
      .slice(6, -4)
      // Replace [id] with :id and [...slug] with :slug+
      .replace(/\[([.\w]+\+?)\]/g, (_, m) => `:${m}`)
      // Replace catch-all params (e.g., :slug+) with wildcard (*)
      .replace(/:\w+\+/, '*')
      // Convert /index to /
      .replace(/\/index$/, '/')
      // Remove trailing slashes
      .replace(/(.+)\/+$/, (_, m) => m[1])
  )
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

  // ------------------------------------------------------------------
  // 2. Match request to route and generate RSC response
  // ------------------------------------------------------------------
  const routes = buildRouteConfig()

  const rscResponse = await matchRSCServerRequest({
    createTemporaryReferenceSet,
    decodeAction,
    decodeFormState,
    decodeReply,
    loadServerAction,
    request,
    routes,
    async generateResponse(match) {
      // Extract head metadata from the matched route's page module
      const head = match.route?.id ? await extractHeadMeta(match.route.id, renderRequest.url) : null

      const rscPayload = {
        root: match.payload?.root ?? null,
        head,
        formState,
        returnValue,
      }

      return new Response(renderToReadableStream(rscPayload), {
        status: actionStatus ?? match.statusCode,
        headers: match.headers,
      })
    },
  })

  // ------------------------------------------------------------------
  // 3. Return RSC stream for .rsc requests
  // ------------------------------------------------------------------
  if (renderRequest.isRsc) {
    return rscResponse
  }

  // ------------------------------------------------------------------
  // 4. Delegate to SSR environment for full document (HTML) requests
  // ------------------------------------------------------------------
  const ssrEntry = await import.meta.viteRsc.import('./ssr-entry.jsx', { environment: 'ssr' })
  const htmlResult = await ssrEntry.generateHTML(request, await rscResponse.clone())

  return new Response(htmlResult.stream, {
    status: htmlResult.status,
    headers: { 'Content-Type': 'text/html' },
  })
}

export default { fetch: handler }

if (import.meta.hot) {
  import.meta.hot.accept()
}
