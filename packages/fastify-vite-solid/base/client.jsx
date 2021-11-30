import { Suspense } from 'solid-js'
// import { Title, Style, MetaProvider } from 'solid-meta'
import { Router, Route, Routes } from 'solid-app-router'
import routes from '@app/routes.js'

export function createApp (context) {
  return {
    App,
    routes,
    router: Router,
    context,
  }
}

      /*<Title>fastify-vite-solid examples</Title>
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
      `}</Style>*/

        // {routes.map(({ path, component: RouteComp }) => {
        //   return <Route path={path} element={<RouteComp />} />
        // })}

function App (routes) {
  return (
    <>
      <h1>Examples</h1>
      <Routes>
        <Route path="/" element={routes[0].component} />
      </Routes>
    </>
  )
}
