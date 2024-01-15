import { hydrateRoot } from 'react-dom/client'
import { createApp } from './base.jsx'

hydrateRoot(
  document.getElementById('root'),
  createApp()
)
