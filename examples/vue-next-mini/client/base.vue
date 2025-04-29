<template>
  <router-view v-slot="{ Component }">
    <Suspense>
      <component
        :is="Component"
        :key="$route.path"
      />
    </Suspense>
  </router-view>
</template>

<style>
html {
  background: #f0e5d3;
}
* {
  font-size: 1.2em;
  font-family: sans-serif;
}
button {
  margin: 0 0.5em;
}
#root {
  display: flex;
  place-items: center;
  flex-direction: column;
}
</style>
