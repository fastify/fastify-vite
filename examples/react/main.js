
import { StaticRouter } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'

export function createApp (req) {
  const app = App
  const ctx = { req }
  return {
    ctx,
    app,
    router: typeof window === 'undefined' ? StaticRouter : BrowserRouter
  }
}
