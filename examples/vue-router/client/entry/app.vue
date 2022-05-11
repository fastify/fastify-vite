<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <component :key="$route.path" :is="Component" />
    </Suspense>
  </router-view>
</template>
