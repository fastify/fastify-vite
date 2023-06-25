import { createRoot } from 'react-dom/client'
import { createApp } from './base.jsx'

const root = createRoot(document.querySelector('main'))
root.render(createApp())
