import { Helmet } from 'react-helmet'
import { Link, Route, Switch } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Hello from './pages/Hello.jsx'

const pages = import.meta.globEager('./pages/*.jsx')

const routes = Object.keys(pages).map((path) => {
  const name = path.match(/\.\/pages(.*)\.jsx$/)[1].toLowerCase()
  return {
    path: name === '/home' ? '/' : name,
    component: name === '/home' ? Home : Hello,
    name
  }
})

export function App (props) {
  return (
    <>
      <Helmet>
        <title>React test</title>
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
      {routes.map(({ name, path }) => {
        return <Link key={path} to={path}>{name}</Link>
      })}
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
