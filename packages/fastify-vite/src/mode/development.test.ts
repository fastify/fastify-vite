import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ModuleRunner } from 'vite/module-runner'

// Mock vite before importing the module under test
vi.mock('vite', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vite')>()
  return {
    ...actual,
    createServerModuleRunner: vi.fn(),
  }
})

import { createServerModuleRunner } from 'vite'
import { loadEntries } from './development.ts'

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
