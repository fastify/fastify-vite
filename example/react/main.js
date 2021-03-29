
import App from './base.jsx'

export function createApp(req) {
  const app = App
  const ctx = { req } 
  return { ctx, app }
}
