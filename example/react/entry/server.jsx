import ReactDOMServer from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { App } from '../base'

export function render(url, context) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <App />
    </StaticRouter>
  )
}

import { createApp } from '../main'
import { getRender } from 'fastify-vite/render'

export const render = getRender(createApp)
