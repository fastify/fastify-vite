export interface ClientModule {
  createApp?: (...args: unknown[]) => unknown
  create?: (...args: unknown[]) => unknown
  routes?: unknown
  [key: string]: unknown
}

export interface ClientEntries {
  ssr?: ClientModule
  [key: string]: unknown
}
