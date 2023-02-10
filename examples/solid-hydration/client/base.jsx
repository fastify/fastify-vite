import { Router, Routes, Route } from '@solidjs/router'
import { createContext, useContext, createSignal } from 'solid-js'
import routes from './routes.js'

export function createApp (props) {
  return (
    <StateProvider todoList={props.data.todoList}>
      <App />
    </StateProvider>
  )
}

const State = createContext()

export function StateProvider (props) {
  // eslint-disable-next-line solid/reactivity
  const [todoList, setTodoList] = createSignal(props.todoList)
  const state = [{ todoList }, {
    addItem (item) {
      setTodoList(todoList => [...todoList, item])
    },
  }]
  return (
    <State.Provider value={state}>
      {props.children}
    </State.Provider>
  )
}
export function App (props) {
  return (
    <Router>
      <Routes>{
        // eslint-disable-next-line solid/prefer-for
        routes.map((props) => {
          return <Route path={props.path} element={
            <props.component state={useContext(State)} />
          } />
        })
      }</Routes>
    </Router>
  )
}
