<template>
	<p v-if="state.loading">
		Loading...
	</p>
	<template v-else>
		<ul>
			<li v-for="item in state.data.todoList">{{ item }}</li>
		</ul>
		<form>
		  <input v-model="item">
	    <button @click="addItem">Add</button>
	  </form>
	  <p>
	  	<router-link to="/other">Go to another page</router-link>
	  </p>
	</template>
</template>

<script>
import ky from 'ky-universal'
import { reactive, ref } from 'vue'
import { useRouteState } from '/entry/app.js'

export default {
	async setup () {
		const state = useRouteState(() => {
			return ky.get('/state').json()
		})
		const item = ref('')
		const addItem = async () => {
    	const json = { item: item.value }
      await ky.post('/add', { json }).json()
      state.todoList.push(item.value)
      item.value = ''
    }
    return { state, item, addItem }
   }
}
</script>
