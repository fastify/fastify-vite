<template>
	<p>{{message}}</p>
</template>

<script>
export default {
	props: {
		secs: Number,
	},
	async setup (props) {
		const message = await afterSeconds({
	  	message: 'Delayed as an asynchronous component',
	  	seconds: props.secs
	  })
		return { message }
	}
}

function afterSeconds ({ message, seconds }) {
  return new Promise((resolve) => {
    setTimeout(() => {
    	resolve(message)
    }, seconds * 1000)
  })
}
</script>