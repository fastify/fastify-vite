import './base.css'
import { hydrateRoot } from 'react-dom/client'
import { createApp } from './base.jsx'

hydrateRoot(
  document.getElementById('root'),
  // No need to pass url as second parameter
  // here since BrowserRouter is used on the client
  createApp(),
)
