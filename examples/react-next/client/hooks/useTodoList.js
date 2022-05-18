import { useState } from 'react'

export class useTodoList extends Array () {
  constructor () {
    const state = useState([])
    this.updateState = state[1]
    this.push(state[1])
    this.push(this.updateList.bind(this))
  }
  updateTodoList (input) {
    this.updateState(state => [...state, input.value])
  }
}
