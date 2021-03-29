import { createApp } from '../main'
import { hydrate } from 'fastify-vite/react/hydrate'
import ReactDOM from 'react-dom'
import { createContext } from 'react';
import { BrowserRouter } from 'react-router-dom'

const { app } = createApp()

ReactDOM.hydrate(
  <BrowserRouter>
    {app()}
  </BrowserRouter>,
  document.getElementById('root')
)
