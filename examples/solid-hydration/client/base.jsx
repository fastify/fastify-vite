import { createContext, useContext, createSignal } from 'solid-js'
import { Router, Routes, Route } from 'solid-app-router'
import routes from './routes.js'

export function createApp ({ data }) {
  return (
    <StateProvider todoList={data.todoList}>
      <App />
    </StateProvider>
  )
}

const State = createContext()

export function StateProvider (props) {
  const [todoList, setTodoList] = createSignal(props.todoList)
  const state = [{ todoList }, {
    addItem (item) {
      setTodoList(todoList => [...todoList, item])
    }
  }]
  return (
    <State.Provider value={state}>
      {props.children}
    </State.Provider>
  );
}
export function App ({ data }) {
  return (
    <Router>
      <Routes>{
        routes.map(({ path, component: Component }) => {
          return <Route path={path} element={
            <Component state={useContext(State)} />
          } />
        })
      }</Routes>
    </Router>
  )
}
