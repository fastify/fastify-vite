<template>
  <h2>Todo List — Using Custom Layout</h2>
  <ul>
    <li 
      v-for="(item, i) in todoList.state"
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
  <p>This example is exactly the same as <router-link to="/using-store">/using-store</router-link>,
  except it's wrapped in a custom layout which blocks it until 
  <code>user.authenticated</code> is <code>true</code> in the global state.</p>
</template>

<script>
import { ref } from 'vue'
import { todoList } from '$app/stores'

export const layout = 'auth'

export function getMeta () {
  return { title: 'Using Custom Layout' }
}

export default {
  setup () {
    const inputValue = ref(null)
    const addItem = async () => {
      await todoList.add(inputValue.value)
      inputValue.value = ''
    }
    return { todoList, inputValue, addItem }
  }
}
</script>
