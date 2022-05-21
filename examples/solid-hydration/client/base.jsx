import { Router, Routes, Route } from 'solid-app-router'
import routes from './routes.js'

export function createApp ({ data }) {
  return <App data={data} />
}

export function App ({ data }) {
  return (
    <Router>
      <Routes>{
        routes.map(({ path, component: Component }) => {
          return <Route path={path} element={<Component data={data} />} />
        })
      }</Routes>
    </Router>
  )
}
