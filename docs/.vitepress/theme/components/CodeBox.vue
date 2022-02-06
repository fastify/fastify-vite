<template>
	<div class="code-box">
		<div class="heading">
			<h4>{{ title }}</h4>
			<span class="copied" :visible="copied">Copied</span>
			<select v-model="displayedSlot">
				<option v-for="s in availableSlots" :key="s.key" :value="s.key">{{ s.displayText }}</option>
			</select>
		</div>
		<div class="inline-code" ref="codeEl" @click="copy">
			<code>
				<slot :name="displayedSlot"/>
			</code>
		</div>
	</div>
</template>

<script setup>
import { ref, getCurrentInstance, toRef, computed } from 'vue'

defineProps({
	title: String,
})

const slots = toRef(getCurrentInstance(), 'slots')

const availableSlots = computed(() => {
	return [
		{
			key: 'js',
			displayText: 'JavaScript',
		},
		{
			key: 'ts',
			displayText: 'TypeScript',
		},
		{
			key: 'sh',
			displayText: 'Terminal',
		},
	{
	  key: 'vue',
	  displayText: 'Vue',
	},
	].filter(({ key }) => slots.value[key])
})

const codeEl = ref()
const copied = ref(false)

const displayedSlot = ref(availableSlots.value[0]?.key || 'js')

function copy () {
	navigator.clipboard.writeText(codeEl.value.innerText)
	copied.value = true
	setTimeout(() => copied.value = false, 3000)
}
</script>

<style scoped>
.code-box {
	background-color: var(--c-brand-light);
	border: 1px solid var(--code-inline-bg-color);
	border-radius: 5px;
	margin-top: 1em;
}

.code-box :deep(pre) {
		padding: 0 1.25rem;
}

.heading {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	padding-block-end: 1px;
	color: var(--c-text-light-1);
}

h4 {
	margin-inline-start: 5px;
	margin-inline-end: auto;
	font-size: 80%;
}

.copied {
	opacity: 0;
	font-size: 70%;
	padding-inline-end: 10px;
		transition: opacity 200ms linear;
}

.copied[visible=true] {
		opacity: 1;
}

select {
	background-color: #191919;
	color: var(--c-text-lighter);
	border: none;
	border-radius: 4px;
	padding: 8px 4px;
}

.inline-code {
	cursor: pointer;
	margin: 0;
	padding: 10px;
}
</style>
