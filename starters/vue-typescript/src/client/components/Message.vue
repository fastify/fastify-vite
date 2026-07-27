<template>
  <p>{{ message }}</p>
</template>

<script lang="ts">
export default {
  props: {
    secs: { type: Number, required: true },
  },
  async setup(props: { secs: number }) {
    const message = await afterSeconds({
      message: 'Delayed as an asynchronous component',
      seconds: props.secs,
    })
    return { message }
  },
}

function afterSeconds({ message, seconds }: { message: string; seconds: number }) {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(message)
    }, seconds * 1000)
  })
}
</script>
