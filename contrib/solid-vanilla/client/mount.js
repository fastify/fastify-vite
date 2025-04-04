import { hydrate } from 'solid-js/web'
import { createApp } from './base.jsx'

hydrate(
  createApp(),
  document.getElementById('root')
)
