import { createApp } from '../main'
import { getRender } from 'fastify-vite/react/render'
// import { Link, Route, Switch, StaticRouter, BrowserRouter } from 'react-router-dom'

export const render = getRender(createApp)