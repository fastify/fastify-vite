import './base.css'
import { hydrate } from 'solid-js/web'
import { createApp } from './base.jsx'

// Patch to address hydrate() error
// Reported to SolidJS's author for investigation
globalThis._$HY = {}

hydrate(
  createApp(window.hydration),
  document.querySelector('main'),
)
