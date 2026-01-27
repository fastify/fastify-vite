import type { Manifest } from 'vite'
import type { ExtendedResolvedViteConfig } from './vite-configs.ts'

export interface Bundle {
  manifest?: Manifest
  indexHtml?: string
  dir?: string
}

export interface BundleConfig {
  dev: boolean
  vite: ExtendedResolvedViteConfig
  root: string
  baseAssetUrl?: string
  originalBase?: string
}
