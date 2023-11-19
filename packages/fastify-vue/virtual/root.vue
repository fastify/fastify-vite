<script>
export function configure (app) {
  // Extend Vue application instance here
}
</script>

<script setup>
import Layout from '/dx:layout.vue'
</script>

<template>
  <router-view v-slot="{ Component }">
    <template v-if="$isServer">
      <Layout>
        <component
          :is="Component"
          :key="$route.path"
        />
      </Layout>
    </template>
    <Suspense v-else>
      <Layout>
        <component
          :is="Component"
          :key="$route.path"
        />
      </Layout>
    </Suspense>
  </router-view>
</template>
