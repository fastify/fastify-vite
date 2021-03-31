import { createApp } from '../main'
import { hydrate } from 'fastify-vite/react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
const { app } = createApp()

ReactDOM.hydrate(
  <BrowserRouter>
    {hydrate(app)}
  </BrowserRouter>,
  document.getElementById('root')
)
