<template>
  <h2>Todo List — Using Store</h2>
  <ul>
    <li 
      v-for="(item, i) in state.todoList"
      :key="`item-${i}`">
      {{ item }}
    </li>
  </ul>
  <div>
    <input v-model="inputValue" />
    <button @click="addItem">Add</button>
  </div>
  <p>
    <router-link to="/">Go back to the index</router-link>
  </p>
  <p>⁂</p>
  <p>When you navigate away from this route, any additions to the to-do 
  list are not lost, because they're bound to the global application state.</p>
</template>

<script>
import { ref } from 'vue'
import { useRouteContext } from '/dx:core.js'

export function getMeta () {
  return { title: 'Todo List — Using Store' }
}

export default {
  setup () {
    const inputValue = ref(null)
    const { state, actions } = useRouteContext()
    const addItem = async () => {
      await actions.todoList.add(state, inputValue.value)
      inputValue.value = ''
    }
    return { state, inputValue, addItem }
  },
}
</script>
