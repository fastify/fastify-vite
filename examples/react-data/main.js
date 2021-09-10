
import { StaticRouter } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import { App } from './base'

export function createApp (context) {
  return {
    App,
    router: import.meta.env.SSR ? StaticRouter : BrowserRouter,
    context,
  }
}
