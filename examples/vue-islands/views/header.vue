<template>
  <h1 @click="click">Hi, I'm supposed to be a header</h1>
</template>

<script>
export const island = 'header'

export default {
  methods: {
    click () {
      console.log('yep, it works')
    }
  }
}
</script>
