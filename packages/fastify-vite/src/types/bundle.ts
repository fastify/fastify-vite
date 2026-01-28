import type { Manifest } from 'vite'
import type { SerializableViteConfig } from './vite-configs.ts'

export interface Bundle {
  manifest?: Manifest
  indexHtml?: string
  dir?: string
}

export interface BundleConfig {
  dev: boolean
  vite: SerializableViteConfig
  root: string
  baseAssetUrl?: string
  originalBase?: string
}
