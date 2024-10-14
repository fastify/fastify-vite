<template>
  <h2>Todo List — Using Data</h2>
  <ul>
    <li 
      v-for="(item, i) in todoList"
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
  list will be lost, because they're bound to this route component only.</p>
  <p>See the <router-link to="/using-store">/using-store</router-link> example to learn 
  how to use the application global state for it.
  </p>
</template>

<script>
import { ref, reactive } from 'vue'
import { useData } from '$app/hooks'

export function getMeta () {
  return { title: 'Todo List — Using Data' }
}

export function getData ({ server }) {
	return {
		todoList: server.db.todoList
	}
}

export default {
  setup () {
    const data = useData()
    const inputValue = ref(null)
    const todoList = reactive(data.todoList)
    const addItem = () => {
      todoList.push(inputValue.value)
      inputValue.value = ''
    }
    return { inputValue, todoList, addItem }
  }
}
</script>
