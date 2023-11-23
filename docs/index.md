---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "@fastify/vite"
  text: "Titans Combined"
  tagline: Cleanly and elegantly integrate <b><a href="https://fastify.dev/" target="_blank">Fastify</a></b> and <b><a href="https://vitejs.dev/" target="_blank">Vite</a></b> to create a <b>minimal</b>, <b>low overhead</b>, <b>blazing fast™</b> setup for <b>full stack monoliths</b>.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: brand
      text: "@fastify/vue"
      link: /vue/index
    - theme: brand
      text: "@fastify/react"
      link: /react/index
    - theme: alt
      text: View on GitHub
      link: https://github.com/fastify/fastify-vite
  image:
    src: /fastify-vite.svg
    alt: "@fastify/vite"

title: "@fastify/vite"
titleTemplate: Fastify plugin for Vite integration

features:
  - icon: 🐅
    title: Fastify-first
    details: Your Fastify server instance stays in control of how the Vite frontend is attached.
  - icon: ⚡
    title: Developer-friendly
    details: Seamlessly switch between development mode with hot reload and production mode shipping your static bundle.
  - icon: 🌐
    title: Universal route modules
    details: Bundles Vue and React renderers featuring the same minimal API providing essential Nuxt and Next-like features.
  - icon: 🛠
    title: Framework toolbox
    details: Granular configuration options to customize loading of Vite modules allow you to build your own framework.
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);

  --vp-home-hero-image-background-image: linear-gradient(-45deg, #000 100%, #000 100%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
