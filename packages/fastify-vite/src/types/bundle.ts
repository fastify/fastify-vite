import type { Manifest } from 'vite'
import type { ViteConfigForBundle } from './vite-configs.ts'

export interface Bundle {
  manifest?: Manifest
  indexHtml?: string
  dir?: string
}

export interface BundleConfig {
  dev: boolean
  vite: ViteConfigForBundle
  root: string
  baseAssetUrl?: string
  originalBase?: string
}
