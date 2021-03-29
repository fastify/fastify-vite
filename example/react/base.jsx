import { Link, Route, Switch } from 'react-router-dom'

const pages = import.meta.globEager('./pages/*.jsx')

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages(.*)\.jsx$/)[1].toLowerCase()
  return {
    path: name === '/index' ? '/' : name,
    component: pages[path]
  }
})

export function App() {
  return (
    <>
      <Helmet>
        <style>{`
          #app {
            font - family: Avenir, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-align: center;
              color: #2c3e50;
              margin-top: 60px;
            }`}
        </style>
      </Helmet>
      <nav>
        <ul>
          {routes.map(({ name, path }) => {
            return (
              <li key={path}>
                <Link to={path}>{name}</Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <Switch>
        {routes.map(({ path, component: RouteComp }) => {
          return (
            <Route key={path} path={path}>
              <RouteComp />
            </Route>
          )
        })}
      </Switch>
    </>
  )
}
