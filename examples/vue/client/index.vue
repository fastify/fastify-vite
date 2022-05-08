<template>
	<ul>
		<li v-for="item in todoList">{{ item }}</li>
	</ul>
	<input v-model="item">
  <button @click="addItem">Add</button>
  <p>
  	<router-link to="/other">Go to another page</router-link>
  </p>
</template>

<script>
import ky from 'ky-universal'
import { reactive, ref } from 'vue'
import { useRouteData } from '/entry/app'

export default {
	async setup () {
		const { todoList: raw } = await useRouteData(() => {
			return ky.get('/data').json()
		})
		const todoList = reactive(raw)
		const item = ref('')
		const addItem = async () => {
    	const json = { item: item.value }
      await ky.post('/add', { json }).json()
      todoList.push(item.value)
      item.value = ''
    }
    return { todoList, item, addItem }
   }
}
</script>
