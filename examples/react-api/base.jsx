import { Helmet } from 'react-helmet'
import { Route, Switch } from 'react-router-dom'
import routes from './routes'

export function App (props) {
  return (
    <>
      <Helmet>
        <title>fastify-vite-react examples</title>
        <style>{`
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
        `}</style>
      </Helmet>
      <h1>Examples</h1>
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
