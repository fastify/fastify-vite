<template>
	<Message :secs="2" />
	<Message :secs="4" />
	<Message :secs="6" />
</template>

<script>
import Message from '/components/Message.vue'

export const streaming = true

export function getMeta () {
	return {
		title: 'Streaming Page',
		bodyAttrs: {
			class: 'streaming',
		},
	}
}

export default {
	components: { Message },
}
</script>