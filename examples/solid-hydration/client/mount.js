import './base.css'
import { hydrate } from 'solid-js/web'
import { createApp } from './base.jsx'

globalThis._$HY = {}

hydrate(
  createApp(window.hydration),
  document.querySelector('main'),
)
