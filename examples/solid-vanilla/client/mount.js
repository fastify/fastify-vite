import { hydrateRoot } from 'react-dom/client'
import { createApp } from './base.jsx'

hydrateRoot(
  document.querySelector('main'),
  createApp()
)
