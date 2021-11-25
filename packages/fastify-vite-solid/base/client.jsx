import React, { Suspense, Fragment } from 'solid-js'
import { Title, Style } from 'solid-meta'
import { Router, Route, Switch } from 'solid-app-router'
import routes from '@app/routes.js'

export function createApp (context) {
  return {
    App,
    routes,
    router: Router,
    context,
  }
}

function App (routes, props) {
  return (
    <>
      <Title>fastify-vite-react examples</Title>
      <Style>{`
      #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 60px;
      }
      body {
        margin: 0px auto;
        width: 500px;
      }
      ul {
        margin: 0px;
        padding: 0px;
      }
      li {
        list-style-type: none;
        padding-left:  0px;
      }
      li span {
        margin-right: 0.5rem;
      }
      code {
        font-weight:  bold;
        font-size:  1rem;
        color: #555;
      }
      `}</Style>
      <h1>Examples</h1>
      {import.meta.env.SSR
        ? <Fragment>
            <Switch>
              {routes.map(({ path, component: RouteComp }) => {
                return (
                  <Route key={path} path={path}>
                    <RouteComp {...props} />
                  </Route>
                )
              })}
            </Switch>
          </Fragment>
        : <Suspense fallback={<div/>}>
            <Switch>
              {routes.map(({ path, component: RouteComp }) => {
                return (
                  <Route key={path} path={path}>
                    <RouteComp {...props} />
                  </Route>
                )
              })}
            </Switch>
          </Suspense>
      }
    </>
  )
}
