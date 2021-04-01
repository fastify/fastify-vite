import { Helmet } from 'react-helmet'
import { Link, Route, Switch, StaticRouter, BrowserRouter } from 'react-router-dom'

const pages = import.meta.globEager('./pages/*.jsx')

import Home from './pages/home'
import Hello from './pages/hello'

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages(.*)\.jsx$/)[1].toLowerCase()
  return {
    path: name === '/home' ? '/' : name,
    component: name === '/home' ? Home : Hello,
    name
  }
})

const Router = typeof window === 'undefined' ? StaticRouter : BrowserRouter

export default function App(props) {
  console.log(props)
  return (
    <>
      <Helmet>
        <style>{`
          #root {
            font - family: Avenir, Helvetica, Arial, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-align: center;
              color: #2c3e50;
              margin-top: 60px;
            }`}
        </style>
      </Helmet>
      {/* <Router location={url}> */}
        <div>
          <ul>
            {routes.map(({ name, path }) => {
              return (
                <li key={path}>
                  <Link to={path}>{name}</Link>
                </li>
              )
            })}
          </ul>
        </div>
        <Switch>
          {routes.map(({ path, component: RouteComp }) => {
            return (
              <Route key={path} path={path}>
                <RouteComp  {...props} />
              </Route>
            )
          })}
        </Switch>
      {/* </Router> */}
    </>
  )
}
