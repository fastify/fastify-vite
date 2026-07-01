import { createRoot, hydrateRoot } from 'react-dom/client'
import { createElement, useState, useEffect, startTransition } from 'react'
import { hydrateRoutes } from '@fastify/react/client'
import { createHead } from '@unhead/react/client'
import routes from '$app/routes.js'
import create from '$app/create.jsx'
import * as context from '$app/context.js'

async function mountApp(...targets: string[]) {
  let mountTargetFound = false
  for (const target of targets) {
    const targetElem = document.querySelector(target)
    if (targetElem) {
      mountTargetFound = true

      // Detect RSC page via FLIGHT_DATA (injected by SSR entries in the HTML)
      const isRscPage = window.__FLIGHT_DATA

      if (isRscPage) {
        // RSC path — decode payload BEFORE hydration (canonical starter pattern)
        // Dynamically import to avoid pulling RSC deps for non-RSC pages
        const { rscStream } = await import('rsc-html-stream/client')
        const { createFromReadableStream, setServerCallback } =
          await import('@vitejs/plugin-rsc/browser')

        // The @vitejs/plugin-rsc/browser module's initialize() calls
        // setRequireModule internally. The react-server-dom vendor file uses
        // a __webpack_require__-based module loading system which gets
        // patched by rsc:patch-react-server-dom-webpack during transformation.
        // However, Vite's esbuild-based dep pre-bundling skips this transform,
        // leaving the pre-bundled vendor file with undefined __webpack_require__.
        // We define it here as a delegate to __vite_rsc_require__ (set up by
        // setRequireModule). Additionally, the RSC flight data protocol decodes
        // $$ -> $, so the $$cache= tag created by createReferenceCacheTag becomes
        // $cache= after flight data decoding. The internal removeReferenceCacheTag
        // looks for $$cache= and misses it, so we strip $cache= here too.
        // Note: we use string concatenation to avoid the
        // rsc:patch-react-server-dom-webpack transform from inadvertently
        // patching this polyfill code.
        const wpRequire = '__' + 'webpack_require' + '__'
        if (typeof (globalThis as any)[wpRequire] === 'undefined') {
          ;(globalThis as any)[wpRequire] = (id: string) => {
            // Strip $cache= tag (single $ version). The RSC protocol flight data
            // decodes $$ -> $, so createReferenceCacheTag's $$cache= becomes $cache=.
            // IMPORTANT: Only strip $cache= when $$cache= is NOT present —
            // $cache= matches inside $$cache= (at the second $), producing
            // a broken URL like /components/foo.jsx$ instead of /components/foo.jsx.
            // When $$cache= is present, removeReferenceCacheTag handles it.
            if (id.includes('$$cache=')) {
              return (globalThis as any).__vite_rsc_require__(id)
            }
            const cc = '$' + 'cache='
            const cleanId = id.includes(cc) ? id.split(cc)[0] : id
            return (globalThis as any).__vite_rsc_require__(cleanId)
          }
          ;(globalThis as any)[wpRequire].u = () => {}
        }

        // Also strip $cache= tag directly in __vite_rsc_require__ — the
        // __webpack_require__ polyfill above handles calls from the pre-bundled
        // vendor file, but when the rsc:patch-react-server-dom-webpack transform
        // replaces __webpack_require__ directly with __vite_rsc_require__ (bypassing
        // the polyfill), $cache= still reaches __vite_rsc_require__. The RSC
        // protocol decodes $$ -> $, so $$cache= becomes $cache= after flight data
        // decoding, but removeReferenceCacheTag only looks for $$cache=.
        // IMPORTANT: $cache= substring check matches inside $$cache= (at the
        // second $), stripping from the wrong position. Always check $$cache=
        // first and delegate to the original handler which knows how to strip it.
        const _origViteRscRequire = (globalThis as any).__vite_rsc_require__
        ;(globalThis as any).__vite_rsc_require__ = (id: string) => {
          if (id.includes('$$cache=')) {
            return _origViteRscRequire(id)
          }
          const cacheIdx = id.indexOf('$cache=')
          if (cacheIdx !== -1) id = id.slice(0, cacheIdx)
          return _origViteRscRequire(id)
        }

        // ┌─── React Refresh Preamble ──────────────────────────────────────┐
        // │ Set preamble flags BEFORE createFromReadableStream so that       │
        // │ client modules loaded dynamically by the RSC stream decoder      │
        // │ (via __vite_rsc_require__ → import()) don't trigger the          │
        // │ react-refresh-wrapper's preamble check.                          │
        // │ The HTML template <script> that normally sets these flags runs   │
        // │ TOO LATE — after RSC stream decoding starts loading client       │
        // │ modules via import(), and the Rolldown refresh wrapper checks    │
        // │ window.$RefreshReg$ synchronously at module evaluation time.     │
        // └──────────────────────────────────────────────────────────────────┘
        ;(window as any).$RefreshReg$ = () => {}
        ;(window as any).$RefreshSig$ = () => (type: any) => type
        ;(window as any).__vite_plugin_react_preamble_installed__ = true

        const initialPayload = await createFromReadableStream(rscStream)

        function RscRoot() {
          const [payload, setPayload] = useState(initialPayload)

          // Store setter for server action callback invocations
          useEffect(() => {
            ;(window as any).__rscSetPayload = (v: unknown) => startTransition(() => setPayload(v))
            // Register server action callback for initial hydration.
            // RscContent (in rsc-content.jsx) calls setServerCallback only
            // for client-side navigations; for initial page hydration we
            // must register it here.
            setServerCallback(async (id: string, args: unknown[]) => {
              const { createTemporaryReferenceSet, encodeReply, createFromFetch } =
                await import('@vitejs/plugin-rsc/browser')
              const temporaryReferences = createTemporaryReferenceSet()
              const rscUrl = `${window.location.pathname}_.rsc${window.location.search}`
              const payload = await createFromFetch(
                fetch(rscUrl, {
                  method: 'POST',
                  headers: { 'x-rsc-action': id },
                  body: await encodeReply(args, { temporaryReferences }),
                }),
                { temporaryReferences },
              )
              startTransition(() => setPayload(payload))
              const { ok, data } = (payload as any).returnValue ?? {}
              if (!ok) throw data
              return data
            })
          }, [])

          // Apply head metadata from the RSC payload to the document
          useEffect(() => {
            if ((payload as any).head?.title) {
              document.title = (payload as any).head.title
            }
          }, [payload])

          return (payload as any).matches?.[0]?.element ?? null
        }

        // Pass formState as third argument to hydrateRoot
        hydrateRoot(targetElem, createElement(RscRoot), {
          formState: (initialPayload as any).formState,
        })
      } else {
        // Non-RSC path (unchanged)
        const ctxHydration = await extendContext(window.route, context as any)
        const resolvedRoutes = await hydrateRoutes(routes)
        const routeMap = Object.fromEntries(resolvedRoutes.map((route: any) => [route.path, route]))
        const useHead = createHead()
        ctxHydration.useHead = useHead
        ctxHydration.useHead.push(window.route.head)

        const app = create({
          ctxHydration,
          routes: window.routes,
          routeMap,
        })

        if (ctxHydration.clientOnly) {
          createRoot(targetElem).render(app)
        } else {
          hydrateRoot(targetElem, app)
        }
      }

      break
    }
  }
  if (!mountTargetFound) {
    throw new Error(`No mount element found from provided list of targets: ${targets}`)
  }
}

mountApp('#root', 'main')

async function extendContext(
  ctx: Record<string, unknown>,
  {
    // The route context initialization function
    default: setter,
    // We destructure state here just to discard it from extra
    state,
    // Other named exports from context.js
    ...extra
  }: {
    default?: ((ctx: Record<string, unknown>) => Promise<void>) | undefined
    state?: unknown
    [key: string]: unknown
  },
) {
  Object.assign(ctx, extra)
  if (setter) {
    await setter(ctx)
  }
  return ctx
}
