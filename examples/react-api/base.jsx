import { Helmet } from 'react-helmet'
import { Link, Route, Switch } from 'react-router-dom'
import { loadRoutes } from 'fastify-vite-react/app'

const views = import.meta.globEager('./pages/*.jsx')
export const routes = loadRoutes(views)

export function App (props) {
  return (
    <>
      <Helmet>
        <title>React test</title>
        <style>{`
          #app {
            font-family: Avenir, Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-align: center;
            color: #2c3e50;
            margin-top: 60px;
          }
        `}</style>
      </Helmet>
      <Link to="/">Index</Link> - <Link to="/hello">Hello</Link>
      <Switch>
        {routes.map(({ path, component: RouteComp }) => {
          return (
            <Route key={path} path={path}>
              <RouteComp {...props} />
            </Route>
          )
        })}
      </Switch>
    </>
  )
}
