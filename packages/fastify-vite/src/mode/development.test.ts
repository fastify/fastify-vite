import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ModuleRunner } from 'vite/module-runner'

// Mock vite before importing the module under test
vi.mock('vite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vite')>()
  return {
    ...actual,
    createServer: vi.fn(),
    createServerModuleRunner: vi.fn(),
  }
})

import { createServer, createServerModuleRunner } from 'vite'
import { loadEntries, setup } from './development.ts'

describe('loadEntries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reuse existing runners instead of creating new ones', async () => {
    const mockRunner = {
      import: vi.fn().mockResolvedValue({ default: { routes: [] } }),
      close: vi.fn(),
    } as unknown as ModuleRunner

    vi.mocked(createServerModuleRunner).mockReturnValue(mockRunner)

    const mockDecoration = {
      devServer: {
        environments: {
          client: {},
          ssr: { name: 'ssr' },
        },
      },
      entries: {},
      runners: undefined as Record<string, ModuleRunner> | undefined,
    }

    const mockConfig = {
      spa: false,
      viteConfig: {
        root: '/test',
        plugins: [{ name: 'vite-fastify', config: vi.fn() }] as unknown[],
        environments: {
          ssr: {
            build: {
              rollupOptions: {
                input: { index: '/test/server.js' },
              },
            },
          },
        },
      },
      virtualModulePrefix: 'virtual:',
      prepareClient: vi.fn().mockResolvedValue({}),
    }

    // Simulate multiple requests calling loadEntries
    // @ts-expect-error - mock object doesn't match full type
    await loadEntries(mockDecoration, mockConfig)
    // @ts-expect-error - mock object doesn't match full type
    await loadEntries(mockDecoration, mockConfig)
    // @ts-expect-error - mock object doesn't match full type
    await loadEntries(mockDecoration, mockConfig)

    // createServerModuleRunner should only be called once for the 'ssr' environment
    expect(createServerModuleRunner).toHaveBeenCalledTimes(1)

    // The same runner should be reused
    expect(mockDecoration.runners?.ssr).toBe(mockRunner)
  })

  it('should skip runner creation in SPA mode', async () => {
    const mockDecoration = {
      devServer: { environments: { client: {}, ssr: {} } },
      entries: {},
      runners: undefined as Record<string, ModuleRunner> | undefined,
    }

    const mockConfig = {
      spa: true, // SPA mode
      viteConfig: { root: '/test', plugins: [] as unknown[] },
    }

    // @ts-expect-error - mock object doesn't match full type
    await loadEntries(mockDecoration, mockConfig)

    expect(createServerModuleRunner).not.toHaveBeenCalled()
  })
})

describe('setup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should skip reading index.html in onRequest when it does not exist', async () => {
    const transformIndexHtml = vi.fn()
    vi.mocked(createServer).mockResolvedValue({
      middlewares: {},
      environments: {},
      transformIndexHtml,
      close: vi.fn(),
    } as never)

    let onRequestHandler:
      | ((req: unknown, reply: Record<string, unknown>) => Promise<void>)
      | undefined
    const createHtmlFunction = vi.fn()

    const scope: Record<PropertyKey, unknown> = {
      server: {},
      hasDecorator: vi.fn().mockReturnValue(true),
      use: vi.fn(),
      decorate: vi.fn((key: PropertyKey, value: unknown) => {
        scope[key] = value
      }),
      decorateReply: vi.fn(),
      addHook: vi.fn(
        (hook: string, fn: (req: unknown, reply: Record<string, unknown>) => Promise<void>) => {
          if (hook === 'onRequest') {
            onRequestHandler = fn
          }
        },
      ),
    }

    const mockDecoration = {
      scope,
      runtimeConfig: {
        spa: true,
        viteConfig: {
          configFile: false,
          root: '/non-existent-root-dir',
          environments: {},
        },
        createHtmlFunction,
      },
    }

    // @ts-expect-error - mock object doesn't match full type
    await setup(mockDecoration)

    expect(onRequestHandler).toBeDefined()
    const reply: Record<string, unknown> = {}
    await onRequestHandler!({ url: '/' }, reply)

    expect(transformIndexHtml).not.toHaveBeenCalled()
    expect(createHtmlFunction).not.toHaveBeenCalled()
    expect(reply.html).toBeUndefined()
  })
})
