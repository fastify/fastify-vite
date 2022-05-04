<template>
	<ul>
		<li v-for="item in todoList">{{ item }}</li>
	</ul>
	<input v-model="item">
  <button @click="addItem">Add</button>
</template>

<script>
import ky from 'ky-universal'
import { reactive, ref, useSSRContext } from 'vue'

export default {
	setup () {
		const { todoList: raw } = import.meta.env.SSR ? useSSRContext() : window.ssrContext
		const todoList = reactive(raw)
		const item = ref('')
		const addItem = async () => {
    	const json = { item: item.value }
      const status = await ky.post('/add', { json }).json()
      todoList.push(item.value)
      item.value = ''
    }
    return { todoList, item, addItem }
   }
}
</script>
