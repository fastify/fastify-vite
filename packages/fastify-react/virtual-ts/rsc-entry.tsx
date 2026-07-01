// This file is the TypeScript variant of virtual/rsc-entry.jsx
// It is registered in virtualModulesTS and imported via $app/rsc-entry.tsx
// when the Vite plugin is initialized with the ts: true option.
import {
  renderToReadableStream,
  createTemporaryReferenceSet,
  decodeReply,
  loadServerAction,
  decodeAction,
  decodeFormState,
} from '@vitejs/plugin-rsc/rsc'
import { unstable_matchRSCServerRequest as matchRSCServerRequest } from 'react-router'
import { filePathToRoutePath } from '#runtime/route-utils.js'
import ValtioHydrator from '$app/valtio-hydrator.tsx'

const URL_POSTFIX = '_.rsc'
const HEADER_ACTION_ID = 'x-rsc-action'

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

function buildRouteConfig(routesManifest) {
  const keys = Object.keys(routesManifest).sort((a, b) => (a > b ? -1 : 1))
  return keys.map((key) => {
    const filePath = key.slice(1)
    const routePath = filePathToRoutePath(filePath)
    return {
      id: key,
      path: routePath === '' ? '/' : routePath,
      lazy: routesManifest[key],
    }
  })
}

function resolveGetMeta(routeId, routesManifest, url) {
  const loader = routesManifest[routeId]
  if (typeof loader !== 'function') return null
  try {
    return loader().then((mod) => (typeof mod.getMeta === 'function' ? mod.getMeta({ url }) : null))
  } catch (err) {
    console.warn('[rsc-entry] getMeta error:', err)
    return null
  }
}

async function extractOnEnter(routeId, requestUrl, match, routesManifest, state) {
  const loader = routesManifest[routeId]
  if (typeof loader !== 'function') return null

  try {
    const routeModule = await loader()
    if (typeof routeModule?.onEnter === 'function') {
      const leafMatch = match.payload?.matches?.slice(-1)[0]
      const ctx = {
        url: requestUrl,
        params: leafMatch?.params ?? {},
        data: {},
        state: state ?? null,
        server: null,
        req: null,
        reply: null,
        firstRender: true,
        getMeta: !!routeModule.getMeta,
        getData: false,
        onEnter: true,
      }
      const result = await routeModule.onEnter(ctx)
      return result ?? null
    }
  } catch (err) {
    console.error('[rsc-entry] onEnter error:', err)
  }
  return null
}

async function handler(request) {
  const valtioState = request.__valtioState
  const renderRequest = parseRenderRequest(request)

  let returnValue
  let formState
  let temporaryReferences
  let actionStatus
  if (renderRequest.isAction) {
    if (renderRequest.actionId) {
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

  const routesManifest = import.meta.glob('/pages/**/*.{jsx,tsx}', { eager: true, query: '?react' })
  const routes = buildRouteConfig(routesManifest)

  let rscResponse

  try {
    rscResponse = await matchRSCServerRequest({
      createTemporaryReferenceSet,
      decodeAction,
      decodeFormState,
      decodeReply,
      loadServerAction,
      request,
      routes,
      async generateResponse(match) {
        // Execute onEnter and extract head metadata from the matched leaf route
        const leafMatch = match.payload?.matches?.[match.payload.matches.length - 1]
        let head = null
        let onEnterData = null
        if (leafMatch?.route?.id) {
          onEnterData = await extractOnEnter(
            leafMatch.route.id,
            renderRequest.url,
            match,
            routesManifest,
            valtioState,
          )
          head = await resolveGetMeta(leafMatch.route.id, routesManifest, renderRequest.url)
        }

        // Merge onEnterData into Valtio state so client components can read
        // it via useRouteContext() + useSnapshot(). Then remove onEnterData
        // from the payload — it's redundant after merging.
        if (onEnterData && valtioState) {
          Object.assign(valtioState, onEnterData)
        }

        // Spread the full match payload (includes type, matches, loaderData, location)
        const rscPayload = { ...match.payload, head, formState, returnValue }

        // Wrap RSC element tree with ValtioHydrator if Valtio state is available.
        // valtioState may be a plain object (from context.js state()) or a Valtio
        // proxy (if the user returned proxy({...}) from their state function).
        // snapshot() only works on proxy objects — use getVersion() to check
        // silently before calling snapshot(), avoiding Valtio's console.warn.
        if (valtioState && rscPayload.matches?.[0]?.element) {
          const { snapshot, getVersion } = await import('valtio')
          const stateSnapshot =
            getVersion(valtioState) !== undefined ? snapshot(valtioState) : valtioState
          rscPayload.matches[0].element = (
            <ValtioHydrator state={stateSnapshot}>{rscPayload.matches[0].element}</ValtioHydrator>
          )
        }

        const rscOptions = temporaryReferences ? { temporaryReferences } : undefined
        return new Response(renderToReadableStream(rscPayload, rscOptions), {
          status: actionStatus ?? match.statusCode,
          headers: match.headers,
        })
      },
    })

    if (renderRequest.isRsc) {
      return rscResponse
    }

    const ssrEntry = await import.meta.viteRsc.import('./ssr-entry.tsx', { environment: 'ssr' })
    const htmlResult = await ssrEntry.generateHTML(request, rscResponse.clone())

    // Defensive guard: catch empty-body responses early with a clear error.
    if (!htmlResult.body) {
      const body = await htmlResult.text()
      throw new Error(`RSC SSR response has no body (status ${htmlResult.status}): ${body}`)
    }

    // Pass the streaming Response through — ssr-entry.tsx's TransformStream
    // emits chunks progressively, and Fastify's sendWebStream() handles them.
    return htmlResult
  } catch (error) {
    // Log the full error for debugging
    console.error(
      '[rsc-entry] handler error:',
      error?.constructor?.name,
      error?.message,
      error?.stack?.split('\n').slice(0, 4).join('\n'),
    )
    // Render error using Youch (project convention for dev error pages).
    // In production, Youch may not be resolvable from the RSC bundle's
    // runtime location — fall back to a minimal error string.
    try {
      const { Youch } = await import('youch')
      const youch = new Youch()
      const html = await youch.toHTML(error, { title: 'RSC Render Error' })
      return new Response(html, {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      })
    } catch {
      const errorText =
        error?.message ??
        (typeof error === 'string' ? error : (error?.toString() ?? 'Unknown error'))
      return new Response(
        `<html><body><h1>500 — Internal Server Error</h1><pre>${errorText}</pre></body></html>`,
        {
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        },
      )
    }
  }
}

export default { fetch: handler }

if (import.meta.hot) {
  import.meta.hot.accept()
}
