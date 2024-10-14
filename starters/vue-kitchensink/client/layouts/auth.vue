<template>
  <div class="contents">
    <template v-if="!state.user.authenticated">
      <p>This route needs authentication.</p>
      <button @click="actions.authenticate(state)">
        Click this button to authenticate.
      </button>
    </template>
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { useRouteContext } from '@fastify/vue/client'
const { actions, state } = useRouteContext()
</script>
