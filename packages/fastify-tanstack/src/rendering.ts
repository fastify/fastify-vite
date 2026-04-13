import { PassThrough } from 'node:stream'
import { createElement } from 'react'
import { createRequire } from 'node:module'

// Bun's react-dom/server shim only activates through require(), not ESM import.
// Without this, renderToPipeableStream silently uses the wrong implementation.
const _require = createRequire(import.meta.url)
const { renderToPipeableStream } = _require(
  'react-dom/server.node',
) as typeof import('react-dom/server')
import { createMemoryHistory } from '@tanstack/history'
import { RouterProvider } from '@tanstack/react-router'
import type { AnyRouter, AnyRedirect } from '@tanstack/router-core'
import {
  attachRouterServerSsrUtils,
  transformPipeableStreamWithRouter,
} from '@tanstack/router-core/ssr/server'
import { createHtmlTemplateFunction } from '@fastify/vite/utils'
import type { RuntimeConfig } from '@fastify/vite'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

interface RenderResult {
  pipeable: NodeJS.ReadableStream | null
  router: AnyRouter
  redirect?: AnyRedirect
}

export async function createRenderFunction(client: Record<string, unknown>) {
  const createAppRouter = client.createAppRouter as (req?: FastifyRequest) => AnyRouter
  // Registered as reply.render()
  return async function (this: FastifyReply): Promise<RenderResult> {
    const url = this.request.url
    const router = createAppRouter(this.request)

    attachRouterServerSsrUtils({ router, manifest: undefined })

    const history = createMemoryHistory({ initialEntries: [url] })
    router.update({ history })

    await router.load()

    const pendingRedirect = router.stores.redirect.get()
    if (pendingRedirect) {
      return { pipeable: null, router, redirect: pendingRedirect }
    }

    await router.serverSsr?.dehydrate()

    const app = createElement(RouterProvider, { router })

    const pipeable = await new Promise<NodeJS.ReadableStream>((resolve, reject) => {
      try {
        const stream = renderToPipeableStream(app, {
          onShellReady() {
            resolve(stream as unknown as NodeJS.ReadableStream)
          },
          onShellError: reject,
          onError(error: unknown) {
            console.error('SSR streaming error:', error)
          },
        })
      } catch (error) {
        reject(error)
      }
    })

    return { pipeable, router }
  }
}

type HtmlFunction = (this: FastifyReply) => FastifyReply | Promise<FastifyReply>

// The return value of this function gets registered as reply.html()
export async function createHtmlFunction(
  source: string,
  _: FastifyInstance,
  config: RuntimeConfig,
): Promise<HtmlFunction> {
  if (config.spa) {
    const template = createHtmlTemplateFunction(source)
    return function (this: FastifyReply) {
      this.type('text/html')
      this.send(template({ element: '' }))
      return this
    }
  }

  const { beforeHtml, afterHtml } = splitHtmlTemplate(source)

  return async function (this: FastifyReply) {
    const {
      pipeable,
      router,
      redirect: pendingRedirect,
    } = (await (this as any).render()) as RenderResult

    if (pendingRedirect) {
      const resolved = router.resolveRedirect(pendingRedirect)
      const href = resolved.headers.get('Location') ?? '/'
      this.code(resolved.status)
      this.redirect(href)
      return this
    }

    const statusCode = router.stores.statusCode.get()
    this.code(statusCode)
    this.type('text/html')

    if (!pipeable) {
      this.send(beforeHtml + afterHtml)
      return this
    }

    const assembled = assembleHtmlStream(beforeHtml, afterHtml, pipeable)
    const transformed = transformPipeableStreamWithRouter(router, assembled)

    if (config.dev) {
      const checker = new PassThrough()
      let sawBarrier = false
      checker.on('data', (chunk: Buffer) => {
        if (!sawBarrier && chunk.toString().includes('$tsr-stream-barrier')) {
          sawBarrier = true
        }
      })
      checker.on('end', () => {
        if (!sawBarrier) {
          console.warn(
            '[@fastify/tanstack] <Scripts> not found in rendered output. ' +
              'Dehydration will fail. Ensure root route renders <Scripts>.',
          )
        }
      })
      transformed.pipe(checker)
    }

    this.send(transformed)
    return this
  }
}

function splitHtmlTemplate(source: string) {
  const marker = '<!-- element -->'
  const idx = source.indexOf(marker)
  if (idx !== -1) {
    return {
      beforeHtml: source.slice(0, idx),
      afterHtml: source.slice(idx + marker.length),
    }
  }
  const bodyIdx = source.indexOf('</body>')
  if (bodyIdx !== -1) {
    return {
      beforeHtml: source.slice(0, bodyIdx),
      afterHtml: source.slice(bodyIdx),
    }
  }
  return { beforeHtml: source, afterHtml: '' }
}

function assembleHtmlStream(
  beforeHtml: string,
  afterHtml: string,
  pipeable: NodeJS.ReadableStream,
) {
  const stream = new PassThrough()

  const reactOut = new PassThrough()
  reactOut.on('data', (chunk: Buffer) => stream.write(chunk))
  reactOut.on('end', () => {
    stream.write(afterHtml)
    stream.end()
  })
  reactOut.on('error', (err: Error) => stream.destroy(err))

  stream.write(beforeHtml)
  ;(pipeable as any).pipe(reactOut)

  return stream
}
