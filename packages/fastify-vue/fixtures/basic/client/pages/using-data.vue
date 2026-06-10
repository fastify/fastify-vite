<template>
  <h2>Todo List</h2>
  <ul>
    <li v-for="(item, i) in todoList" :key="`item-${i}`">
      {{ item }}
    </li>
  </ul>
</template>

<script>
import { useData } from '$app/hooks'

export function getMeta() {
  return { title: 'Todo List' }
}

export function getData({ server }) {
  return {
    todoList: server.db.todoList,
  }
}

export default {
  setup() {
    const data = useData()
    return { todoList: data.todoList }
  },
}
</script>
